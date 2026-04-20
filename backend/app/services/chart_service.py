def generate_chart(data: list[dict]):
    """
    Generate intelligent chart configuration based on query result.
    """

    # ❌ No data
    if not data:
        return {"type": "none"}

    keys = list(data[0].keys())

    # -------------------------------
    # 🔹 1. KPI (Single Value)
    # -------------------------------
    if len(keys) == 1:
        key = keys[0]
        return {
            "type": "kpi",
            "value": data[0][key],
            "label": key
        }

    # -------------------------------
    # 🔹 2. Time Series Detection
    # -------------------------------
    time_keys = ["date", "time", "created_at", "year", "month"]

    if any(t in k.lower() for k in keys for t in time_keys):
        year_key = next((k for k in keys if "year" in k.lower()), None)
        month_key = next((k for k in keys if "month" in k.lower()), None)

        # prefer explicit orders_count for time-series trends
        y_key = next((k for k in keys if "orders_count" in k.lower()), None)
        if y_key is None:
            y_key = next(
                (k for k in keys if "count" in k.lower() and isinstance(data[0][k], (int, float))),
                None
            )
        if y_key is None:
            excluded = {year_key, month_key}
            y_key = next(
                (k for k in keys if k not in excluded and isinstance(data[0][k], (int, float))),
                keys[-1]
            )

        if year_key and month_key:
            x_values = [f"{row[year_key]}-{str(row[month_key]).zfill(2)}" for row in data]
            x_label = f"{year_key}/{month_key}"
        else:
            x_key = next(
                (k for k in keys if any(t in k.lower() for t in time_keys)),
                keys[0]
            )
            x_values = [row[x_key] for row in data]
            x_label = x_key

        return {
            "type": "line",
            "x": x_values,
            "y": [row[y_key] for row in data],
            "x_label": x_label,
            "y_label": y_key
        }

    # -------------------------------
    # 🔹 3. Aggregation Detection
    # (e.g. total_amount, count, sum)
    # -------------------------------
    agg_keywords = ["total", "sum", "count", "avg", "amount"]

    for key in keys:
        if any(word in key.lower() for word in agg_keywords):
            y_key = key

            # choose best x-axis (avoid id)
            x_key = next(
                (k for k in keys if k != y_key and "id" not in k.lower()),
                keys[0]
            )

            return {
                "type": "bar",
                "x": [row[x_key] for row in data],
                "y": [row[y_key] for row in data],
                "x_label": x_key,
                "y_label": y_key
            }
    # -------------------------------
    # 🔹 4. Two Columns → Bar Chart
    # -------------------------------
    if len(keys) == 2:
        x_key, y_key = keys

        return {
            "type": "bar",
            "x": [row[x_key] for row in data],
            "y": [row[y_key] for row in data],
            "x_label": x_key,
            "y_label": y_key
        }

    # -------------------------------
    # 🔹 5. Fallback → Table
    # -------------------------------
    return {
        "type": "table",
        "columns": keys,
        "rows": data
    }
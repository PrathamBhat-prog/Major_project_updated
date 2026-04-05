import pandas as pd
import json

try:
    df = pd.read_excel('E:/7th sem/major project/website/backend/local_storage/master_sheet.xlsx')
    info = {
        "columns": df.columns.tolist(),
        "row_count": len(df)
    }
    with open('E:/7th sem/major project/website/backend/excel_info.json', 'w') as f:
        json.dump(info, f)
    print("Excel info saved successfully.")
except Exception as e:
    print(f"Error: {e}")

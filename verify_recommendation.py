import json
import requests

payload = {
    'thread_count': 120,
    'gsm': 180,
    'tensile_strength': 35,
    'shrinkage_percent': 2,
    'color_fastness': 4,
    'fabric_thickness': 0.4,
    'defect_count': 1,
    'elongation_percent': 12,
    'moisture_absorption': 7,
    'fabric_type': 'Cotton',
    'weave_type': 'Plain',
    'finish_type': 'Raw',
    'production_method': 'Handloom',
    'batch_id': 1,
    'roll_number': 1,
    'inspection_time_minutes': 20,
    'warehouse_id': 'wh-a',
    'operator_name': 'Suresh',
    'inspection_shift': 'Morning',
    'machine_temperature': 70,
    'humidity_level': 55,
    'inspection_notes': 'Looks fine'
}

r = requests.post('http://127.0.0.1:5000/predict', json=payload)
print('PREDICT', r.status_code)
print(r.text)
rr = requests.post('http://127.0.0.1:5000/recommend', json={'fabric_quality': json.loads(r.text)['predicted_fabric_quality']})
print('RECOMMEND', rr.status_code)
print(rr.text)

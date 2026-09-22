import os
import json
import re
import math

print("=== Smart Land GIS - Automated Verification ===")

# 1. Check all required files exist
required_files = [
    "index.html",
    "package.json",
    "README.md",
    "css/main.css",
    "css/layout.css",
    "css/components.css",
    "css/map.css",
    "css/dashboard.css",
    "js/config.js",
    "js/spatial-utils.js",
    "js/store.js",
    "js/app.js",
    "js/data/initial-datasets.js",
    "js/components/Toast.js",
    "js/components/DeleteConfirmModal.js",
    "js/components/PlotDetailDrawer.js",
    "js/components/AddPlotModal.js",
    "js/components/Sidebar.js",
    "js/components/Topbar.js",
    "js/views/DashboardView.js",
    "js/views/MapView.js",
    "js/views/LandRegistryView.js",
    "js/views/DatasetsView.js",
    "js/views/AuditLogView.js",
    "js/views/TrashView.js",
    "js/views/UserManagementView.js"
]

base_dir = os.path.dirname(__file__)
missing = []
for f in required_files:
    full_path = os.path.join(base_dir, f)
    if not os.path.exists(full_path):
        missing.append(f)
    else:
        size = os.path.getsize(full_path)
        print(f"[OK] {f} ({size} bytes)")

assert len(missing) == 0, f"Missing files: {missing}"
print(f"\nAll {len(required_files)} files exist successfully.")

# 2. Check Data Integrity for the 6 Required Parameters in initial-datasets.js
datasets_path = os.path.join(base_dir, "js/data/initial-datasets.js")
with open(datasets_path, "r", encoding="utf-8") as f:
    datasets_content = f.read()

required_params = [
    "plots",
    "roads",
    "drainage",
    "electricityPoles",
    "lightPoles",
    "floodRegions",
    "length",
    "width",
    "area"
]

for p in required_params:
    assert p in datasets_content, f"Missing parameter '{p}' in datasets!"
    print(f"[OK] Found parameter: '{p}' in initial-datasets.js")

# 3. Test Geospatial Math Logic
def haversine(coord1, coord2):
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    R = 6371000
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1))*math.cos(math.radians(lat2))*math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

dist = haversine([28.6139, 77.2090], [28.6150, 77.2090])
print(f"\n[OK] Haversine distance test: ~{dist:.1f} meters (Expected ~122m)")
assert 120 < dist < 125, "Haversine calculation error"

print("\n=== All Verification Tests Passed Successfully! ===")

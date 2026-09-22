"""
Verification script for Smart Land GIS - KML Flight Plan Support
"""
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import sys

def verify_kml_file():
    kml_path = "assets/kml/flight Plan (1).kml"
    print(f"[TEST 1] Parsing KML file directly: {kml_path}...")
    
    with open(kml_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify root
    root = ET.fromstring(content)
    ns = {"kml": "http://www.opengis.net/kml/2.2"}
    
    placemarks = root.findall(".//kml:Placemark", ns)
    points = [p for p in placemarks if p.find("kml:Point", ns) is not None]
    lines = [p for p in placemarks if p.find("kml:LineString", ns) is not None]
    polygons = [p for p in placemarks if p.find("kml:Polygon", ns) is not None]
    
    print(f"  Placemarks total: {len(placemarks)}")
    print(f"  Points: {len(points)} (Expected: 29)")
    print(f"  Lines: {len(lines)} (Expected: 28)")
    print(f"  Areas/Polygons: {len(polygons)} (Expected: 1)")

    assert len(points) == 29, f"Expected 29 points, got {len(points)}"
    assert len(lines) == 28, f"Expected 28 lines, got {len(lines)}"
    assert len(polygons) == 1, f"Expected 1 polygon, got {len(polygons)}"

    # Check numbered points 1-29
    point_names = set()
    for p in points:
        name_el = p.find("kml:name", ns)
        if name_el is not None and name_el.text:
            point_names.add(name_el.text.strip())

    expected_names = {str(i) for i in range(1, 30)}
    missing = expected_names - point_names
    assert not missing, f"Missing point numbers: {missing}"
    print(f"  Point numbers 1 through 29 fully verified: OK!")

    # Verify coordinate order: lon, lat, alt
    sample_pt = points[0]
    coord_text = sample_pt.find(".//kml:coordinates", ns).text.strip()
    parts = [float(x) for x in coord_text.split(",")]
    lon, lat = parts[0], parts[1]
    print(f"  Sample Waypoint #{sample_pt.find('kml:name', ns).text}: Lon={lon:.4f}, Lat={lat:.4f}")
    assert 73.0 <= lon <= 74.0, f"Longitude unexpected: {lon}"
    assert 18.0 <= lat <= 19.0, f"Latitude unexpected: {lat}"
    print("  Coordinate bounds and order validation: PASS\n")


def verify_http_endpoints():
    print("[TEST 2] Verifying HTTP Endpoints on http://localhost:8080...")
    base_url = "http://localhost:8080"
    
    endpoints = [
        "/index.html",
        "/css/map.css",
        "/js/app.js",
        "/js/store.js",
        "/js/kml-parser.js",
        "/js/views/MapView.js",
        "/js/views/DatasetsView.js",
        "/assets/kml/" + urllib.parse.quote("flight Plan (1).kml")
    ]

    for ep in endpoints:
        url = base_url + ep
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "KML-Verifier"})
            with urllib.request.urlopen(req, timeout=5) as response:
                status = response.getcode()
                content_len = len(response.read())
                print(f"  GET {ep} -> HTTP {status} ({content_len} bytes)")
                assert status == 200, f"Failed with status {status}"
        except Exception as e:
            print(f"  FAILED GET {ep}: {e}")
            raise e

    print("  All HTTP endpoints healthy: PASS\n")

if __name__ == "__main__":
    try:
        verify_kml_file()
        verify_http_endpoints()
        print("ALL KML FLIGHT PLAN VERIFICATION TESTS PASSED SUCCESSFULLY!")
    except Exception as ex:
        print(f"VERIFICATION FAILED: {ex}", file=sys.stderr)
        sys.exit(1)

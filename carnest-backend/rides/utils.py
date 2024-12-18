import requests
from django.conf import settings
from math import radians, sin, cos, sqrt, atan2
API_KEY = settings.API_KEY
def geocode_location(location_name):
    """
    Geocode a location name to latitude and longitude using Google Maps API.
    """
    base_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={location_name}&key={API_KEY}"
    try:
        response = requests.get(base_url)
        data = response.json()
        if response.status_code == 200 and data['results']:
            lat = data['results'][0]['geometry']['location']['lat']
            lng = data['results'][0]['geometry']['location']['lng']
            return lat, lng
        else:
            return None, None
    except Exception as e:
        print(f"Error occurred while geocoding {location_name}: {e}")
        return None, None
    
def get_distance_from_google_maps(origin_lat, origin_lng, destination_lat, destination_lng):
    url = "https://maps.googleapis.com/maps/api/directions/json"
    params = {
        "origin": f"{origin_lat},{origin_lng}",
        "destination": f"{destination_lat},{destination_lng}",
        "key": API_KEY,
    }

    response = requests.get(url, params=params)
    if response.status_code != 200:
        return None 

    data = response.json()
    if data.get("status") != "OK":
        return None 


    distance_meters = data["routes"][0]["legs"][0]["distance"]["value"]
    return round(distance_meters / 1000, 2) 


def get_duration_from_google_maps(origin_lat, origin_lng, destination_lat, destination_lng):

    url = "https://maps.googleapis.com/maps/api/directions/json"
    params = {
        "origin": f"{origin_lat},{origin_lng}",
        "destination": f"{destination_lat},{destination_lng}",
        "key": API_KEY,
    }

    response = requests.get(url, params=params)
    if response.status_code != 200:
        return None 

    data = response.json()
    if data.get("status") != "OK":
        return None
    
    duration_seconds = data["routes"][0]["legs"][0]["duration"]["value"]
    hours, remainder = divmod(duration_seconds, 3600)
    minutes, _ = divmod(remainder, 60)
    return f"{hours}h {minutes}m" if hours else f"{minutes}m"



def haversine(lat1, lng1, lat2, lng2):
    """
    Calculate the great-circle distance between two points
    on the Earth's surface.
    """
    if lat1 is None or lng1 is None or lat2 is None or lng2 is None:
        return None 

    R = 6371  

    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c  

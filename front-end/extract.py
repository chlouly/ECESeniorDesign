import json


front_file_path = './frontendsbom.json'
back_file_path = '../backend/backendsbom.json'


with open(front_file_path, 'r') as f_file:
    f_data = json.load(f_file)

with open(back_file_path, 'r') as b_file:
    b_data = json.load(b_file)

licenses = set()
total_licenses = 0
if 'components' in f_data:
    for component in f_data['components']:
        if 'licenses' in component:
            for license_entry in component['licenses']:
                if 'license' in license_entry:
                    licenses.add(license_entry['license']['id'])
                    total_licenses += 1

if 'components' in b_data:
    for component in b_data['components']:
        if 'licenses' in component:
            for license_entry in component['licenses']:
                if 'license' in license_entry:
                    licenses.add(license_entry['license']['id'])
                    total_licenses += 1

print("Unique Licenses:")
for license in licenses:
    print(license)

print("\nTotal number of unique licenses: ", len(licenses))

print("\nTotal number of packages: ", total_licenses)

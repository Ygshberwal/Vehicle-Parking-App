### How to run the app
```bash
python3 -m venv .parking
source parking/bin/activate
cd vehicle-parking-app
python3 app.py
```


### Folder Structure & file description 
```bash
vehicle-parking-app
├── backend/
    ├── models/
        ├── create_initial_database.py       # initialise database with admin data
        ├── models.py                        # for creating the database
    └── config.py                            # coonfiguration like security keys etc

├── frontend/

├── instance/
    └── database.sqlite3

├── app.py          # will create db automatically, importing both model files
└── README.md
 ```

import os

# DATABASE_URI = 'postgresql+psycopg2://{dbuser}:{dbpass}@{dbhost}:{dbport}/{dbname}'.format(
#     dbuser=os.environ.get('DBUSER'),
#     dbpass=os.environ.get('DBPASS'),
#     dbhost=os.environ.get('DBHOST'),
#     dbport=os.environ.get('DBPORT'),
#     dbname=os.environ.get('DBNAME')
# )

DBUSER=os.environ.get('DBUSER')
DBPASS=os.environ.get('DBPASS')
DBHOST=os.environ.get('DBHOST')
DBNAME=os.environ.get('DBNAME')
SECRET_KEY=os.environ.get('SECRET_KEY')
GEOSERVER_URL=os.environ.get('GEOSERVER_URL')
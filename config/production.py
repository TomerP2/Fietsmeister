import os

# Configure Postgres database based on connection string of the libpq Keyword/Value form
# https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING
# Uncomment the following lines for App Service
# conn_str = os.environ['AZURE_POSTGRESQL_CONNECTIONSTRING']
# conn_str_params = {pair.split('=')[0]: pair.split('=')[1] for pair in conn_str.split(' ')}
# DATABASE_URI = 'postgresql+psycopg2://{dbuser}:{dbpass}@{dbhost}/{dbname}'.format(
#     dbuser=conn_str_params['user'],
#     dbpass=conn_str_params['password'],
#     dbhost=conn_str_params['host'],
#     dbname=conn_str_params['dbname']
# )

DBUSER=os.environ.get('DBUSER')
DBPASS=os.environ.get('DBPASS')
DBHOST=os.environ.get('DBHOST')
DBPORT=os.environ.get('DBPORT')
DBNAME=os.environ.get('DBNAME')
SECRET_KEY=os.environ.get('SECRET_KEY')
GEOSERVER_URL=os.environ.get('GEOSERVER_URL')
import os

# Configure Postgres database based on connection string of the libpq Keyword/Value form
# https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING
# Uncomment the following lines for App Service

conn_str = os.environ.get('AZURE_POSTGRESQL_CONNECTIONSTRING')
conn_str_params = {pair.split('=')[0]: pair.split('=')[1] for pair in conn_str.split(';')}

# Database=fietsmeister-database;Server=fietsmeister-server.postgres.database.azure.com;User Id=cgimeaieqk;Password=53Q13R8PS5J650WX$
# DATABASE_URI = 'postgresql+psycopg2://{dbuser}:{dbpass}@{dbhost}/{dbname}'.format(
#     dbuser=conn_str_params['user'],
#     dbpass=conn_str_params['password'],
#     dbhost=conn_str_params['host'],
#     dbname=conn_str_params['dbname']
# )

DBUSER=conn_str_params['User Id']
DBPASS=conn_str_params['Password']
DBHOST= 'postgresql+psycopg2://' + conn_str_params['Server']
DBNAME=conn_str_params['Database']
SECRET_KEY=os.environ.get('SECRET_KEY')
GEOSERVER_URL=os.environ.get('GEOSERVER_URL')
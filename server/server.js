import {forEach} from 'lodash';
import pem from 'pem';
import jwtSettings from './private/jwt_settings';
import config from './config';

const routes = {
  auth: require('./routes/authentication'),
  search: require('./routes/search'),
  remote: require('./routes/remote'),
  export: require('./routes/export'),
  mapping: require('./routes/mapping'),
  hepsub: require('./routes/hepsub'),
  birds: require('./routes/birds'),
  ui: require('./routes/ui'),
  profile: require('./routes/profile'),
  prometheus: require('./routes/prometheus'),
  any: require('./routes/any'),
  users: require('./routes/users'),
  user_settings: require('./routes/user_settings'),
  alias: require('./routes/alias'),
  advanced: require('./routes/advanced'),
  dashboard: require('./routes/dashboard'),
  statistics: require('./routes/statistics'),
  agent_subscribe: require('./routes/agent_subscribe'),
};

const databases = {
  data: config.db.type.mysql ? require('knex')(config.db.mysql.homerdatadev) : require('knex')(config.db.pgsql.homer_data),
  config: config.db.type.mysql ? require('knex')(config.db.mysql.homerdatadev) : require('knex')(config.db.pgsql.homer_config),
};

const HapiSwagger = require('hapi-swagger');
const Pack = require('../package');



const swaggerOptions = {
      info: {
      		title: 'API Documentation',
                version: Pack.version,
      },
};

const Hapi = require('@hapi/hapi');
const H2o2 = require('@hapi/h2o2');
const AuthJwt2 = require('hapi-auth-jwt2');  
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
                 

const Influx = require('influx');
const influx = new Influx.InfluxDB({
  host: config.db.influxdb.host || '127.0.0.1',
  port: config.db.influxdb.port || 8086,
  database: config.db.influxdb.database || 'homer',
});

databases.statistics = influx;

/* prometheus */
const RequestClient = require('reqclient').RequestClient;
const prometheusClient = new RequestClient({
  baseUrl: config.db.prometheus.protocol + '://' + config.db.prometheus.host + ':' + config.db.prometheus.port + config.db.prometheus.api
});

databases.prometheus = prometheusClient;

const server = new Hapi.Server({
    host: config.http_host || '127.0.0.1',
    port: config.http_port || 8001,      
    debug: {
            log: ['debug', 'warn', 'error', 'implementation', 'internal'],
            request: ['debug', 'warn', 'error', 'implementation', 'internal'],
    },
});

// bring your own validation function
const validate = async function (decoded, request) {

    // do your checks to see if the person is valid
    /*if (!people[decoded.id]) {
        return { isValid: false };
    }
    else {
        return { isValid: true };
    }*/
    return { isValid: true };            
};

(async () => {



    // JWT authentication and encryption
    await server.register([
            H2o2,
            AuthJwt2, 
            Inert, 
            Vision,
            {
                plugin: HapiSwagger,
                options: swaggerOptions
            }
    ]);
        
    server.auth.strategy('token', 'jwt', {
            key: jwtSettings.key, // the JWT private key
            validate: validate,  // validate function defined above                
            verifyOptions: {
                algorithms: [jwtSettings.algorithm],
            },
    });

   // server.auth.default('jwt');  

    server.databases = databases;

    // Initialize routes
    forEach(routes, function(routeSet) {
            if (routeSet.default.name === 'proxy') { // temporary, to be deleted when the new API is ready
                    routeSet.default(server, proxyConfig);
            } else {
                    routeSet.default(server);
            }
    });
          
    try {
        await server.start();
        console.log('Server running at:', server.info.uri);
    } catch(err) {
        console.log(err);
    }
        
})();


export default server;

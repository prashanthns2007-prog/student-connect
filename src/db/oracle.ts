import oracledb from 'oracledb';

// Configuration for Oracle connection
const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECTION_STRING
};

// Initialize pool
let pool: oracledb.Pool | null = null;
export let isDemoMode = false;

export async function initialize() {
  // Check if configuration is present
  if (!dbConfig.user || !dbConfig.password || !dbConfig.connectString) {
    console.warn('Oracle credentials missing. Switching to Demo Mode (Mock Data).');
    isDemoMode = true;
    return;
  }

  if (!pool) {
    try {
      // By default node-oracledb 6.0+ is in Thin mode.
      // We don't call initOracleClient() to stay in Thin mode.
      pool = await oracledb.createPool({
        ...dbConfig,
        poolMin: 1,
        poolMax: 10,
        poolIncrement: 1
      });
      console.log('Oracle Connection Pool initialized successfully');
      isDemoMode = false;
    } catch (err) {
      console.error('Oracle Pool initialization failed:', err);
      console.warn('Switching to Demo Mode (Mock Data) due to connection failure.');
      isDemoMode = true;
    }
  }
}

export async function execute(sql: string, params: any[] = [], options: oracledb.ExecuteOptions = {}) {
  if (isDemoMode) {
    throw new Error('Database is in Demo Mode. Real SQL execution is disabled.');
  }

  let connection;
  try {
    if (!pool) await initialize();
    if (isDemoMode) throw new Error('Database in Demo Mode');
    
    connection = await pool!.getConnection();
    const result = await connection.execute(sql, params, { 
      ...options, 
      outFormat: oracledb.OUT_FORMAT_OBJECT, 
      autoCommit: true 
    });
    return result;
  } catch (err) {
    console.error('SQL Execution Error:', err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

export async function close() {
  if (pool) {
    await pool.close();
  }
}

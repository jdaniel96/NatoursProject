const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`app running on express on port ${port}`);
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('db connections successful jaja omg');
  });

//schema haha blueprint omg jaja

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION ⛔️ shutting down the server');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED shutting down the server gracefully');
  server.close(() => {
    console.log('💣 process terminated');
  });
});

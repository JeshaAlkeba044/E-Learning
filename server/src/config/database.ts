import { sequelize } from '../models';

sequelize.sync({ force: false }).then(() => {
  console.log('Database & tables synced!');
});

export default sequelize;
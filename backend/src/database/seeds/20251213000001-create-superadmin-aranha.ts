import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query(
      `
        INSERT INTO public."Users" ("name",email,"passwordHash","createdAt","updatedAt",profile,"tokenVersion","tenantId","lastLogin","lastLogout","isOnline",configs,"lastOnline",status) VALUES
	      ('Aranha','aranha.com@gmail.com','$2a$08$S26dc/MBEixJ7vwyCBhQquCKM4XVxJgePCh1r9UDqrpwzhw16T0My','2025-12-13 18:57:00.000','2025-12-13 18:57:00.000','super',0,1,NULL,NULL,true,'{"filtrosAtendimento":{"searchParam":"","pageNumber":1,"status":["open","pending","closed"],"showAll":true,"count":null,"queuesIds":[],"withUnreadMessages":false,"isNotAssignedUser":false,"includeNotQueueDefined":true},"isDark":false}','2025-12-13 18:57:00.000','opened')
        ON CONFLICT (email) DO UPDATE SET
          "name" = EXCLUDED."name",
          "passwordHash" = EXCLUDED."passwordHash",
          "updatedAt" = EXCLUDED."updatedAt";
      `
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query(
      `DELETE FROM public."Users" WHERE email = 'aranha.com@gmail.com'`
    );
  }
};

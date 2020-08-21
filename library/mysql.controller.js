/**
 * 处理重复新增.
 *
 * @param {Knex} db
 * @param values
 * @return {*}
 */
function batchInsertDuplicate(db, table, values) {
  if (!Array.isArray(values) || !Boolean(values[0])) {
    throw new Error('插入数组不能为空');
  }

  const keys = Object.keys(values[0]);
  const placeholder = keys.map(() => '?').join(',');
  const placeholders = [];
  const boundValues = [];

  values.forEach((value) => {
    placeholders.push(placeholder);
    boundValues.push(...Object.values(value));
  });

  return db.raw(
    `INSERT INTO \`${table}\` (${keys.join(',')})
		 VALUES ${placeholders.map((p) => `(${p})`).join(',')}
		 on duplicate key update ${keys.map((k) => `${k}=VALUES(${k})`)}`,
    boundValues
  );
}

module.exports = {
  batchInsertDuplicate,
};

export const formTableSorter = (tableKey, form, field, defaultSortOrder) => {
  return (a, b) => {
    if (!form) {
      return defaultSortOrder;
    }

    const aIndex = a.fieldKey;
    const bIndex = b.fieldKey;

    const data = form.getFieldValue(tableKey);

    if (!Boolean(data[aIndex]) || !Boolean(data[aIndex][field])) {
      return 1;
    }

    if (!Boolean(data[bIndex][field]) || !Boolean(data[bIndex][field])) {
      return -1;
    }

    return data[aIndex][field].localeCompare(data[bIndex][field]);
  };
};

export const getFormTableColumnParams = (tableKey, current, field, defaultSortOrder = 'ascend') => {
  return {
    defaultSortOrder,
    key: field,
    sorter: formTableSorter(tableKey, current, field, defaultSortOrder === 'ascend' ? 1 : -1),
    sortDirections: ['ascend', 'descend', 'ascend'],
  };
};

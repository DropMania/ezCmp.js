class JsSql {
    static run(db, query) {
        let keyWords = [
            'SELECT ',
            ' FROM ',
            ' WHERE ',
            ' AND ',
            ' OR ',
            ' ORDER BY ',
            ' ASC',
            ' DESC',
            ' LIMIT ',
            ' OFFSET ',

            ' GROUP BY ',
            ' HAVING ',
            ' JOIN '
        ];
        return query.split('UNION').map(q => {
            let keywordArray = q
                .toUpperCase()
                .match(new RegExp(keyWords.join('|'), 'g'));
            let dataArray = q.split(new RegExp(`${keyWords.join('|')}`, 'g'));
            dataArray.shift();
            let parsedSql = {
                select: '',
                from: '',
                where: [],
                orderBy: ['', 'ASC'],
                limit: '',
                offset: ''
            };
            keywordArray.forEach((keyword, i) => {
                keyword = keyword.trim();
                if (keyword === 'SELECT') {
                    parsedSql.select = dataArray[i].trim();
                }
                if (keyword === 'FROM') {
                    parsedSql.from = dataArray[i].trim();
                }
                if (['WHERE', 'AND', 'OR'].includes(keyword)) {
                    parsedSql.where.push(dataArray[i].trim());
                }
                if (keyword === 'ORDER BY') {
                    parsedSql.orderBy[0] = dataArray[i].trim();
                }
                if (keyword === 'ASC' || keyword === 'DESC') {
                    parsedSql.orderBy[1] = keyword;
                }
                if (keyword === 'LIMIT') {
                    parsedSql.limit = dataArray[i].trim();
                }
                if (keyword === 'OFFSET') {
                    parsedSql.offset = dataArray[i].trim();
                }
                if(keyword === 'GROUP BY'){
                    parsedSql.groupBy = dataArray[i].trim();
                }
            });
            let table = parsedSql.from;
            let fields = parsedSql.select.split(',');
            if (parsedSql.select === '*') {
                fields = Array.from(
                    db[table].reduce((acc, item) => {
                        Object.keys(item).forEach((key) => {
                            acc.add(key);
                        });
                        return acc;
                    }, new Set())
                );
            }
            let where = parsedSql.where.map((whereItem) => {
                let [field, operator, value] = whereItem.split(/\s+/);
                return { field, operator, value };
            });
            let result = [];

            result = db[table].filter((item) => {
                let isValid = true;
                where.forEach((whereItem) => {
                    let field = whereItem.field;
                    let operator = whereItem.operator;
                    let value = whereItem.value.replace(/'|"/g, '');
                    if (operator === '=') {
                        if (item[field] != value) {
                            isValid = false;
                        }
                    }
                    if (operator === '!=') {
                        if (item[field] == value) {
                            isValid = false;
                        }
                    }
                    if (operator === '>') {
                        if (item[field] <= value) {
                            isValid = false;
                        }
                    }
                    if (operator === '<') {
                        if (item[field] >= value) {
                            isValid = false;
                        }
                    }
                    if (operator === '>=') {
                        if (item[field] < value) {
                            isValid = false;
                        }
                    }
                    if (operator === '<=') {
                        if (item[field] > value) {
                            isValid = false;
                        }
                    }
                    if (operator === 'LIKE') {
                        if (!item[field].includes(value)) {
                            isValid = false;
                        }
                    }
                });
                return isValid;
            });
            result = result.reduce((acc, item) => {
                let newItem = {};
                fields.forEach((field) => {
                    let fields = field.split('AS').map((item) => item.trim());
                    let as = (fields[1] || field).trim();
                    let concat = fields[0].split('||').map((item) => item.trim());
                    if (concat.length > 1) {
                        newItem[as] = concat.reduce((acc, val) => {
                            if (val.match(/'|"/)) {
                                return acc + val.replace(/'|"/g, '');
                            } else {
                                return acc + item[val] || '';
                            }
                        }, '');
                    } else {
                        if (concat[0].match(/'|"/)) {
                            newItem[as] = concat[0].replace(/'|"/g, '');
                        } else {
                            newItem[as] = item[concat[0]] || '';
                        }
                    }
                });
                acc.push(newItem);
                return acc;
            }, []);
            if (parsedSql.orderBy[0]) {
                result.sort((a, b) => {
                    if (parsedSql.orderBy[1] === 'ASC') {
                        return a[parsedSql.orderBy[0]] > b[parsedSql.orderBy[0]]
                            ? 1
                            : -1;
                    }
                    if (parsedSql.orderBy[1] === 'DESC') {
                        return b[parsedSql.orderBy[0]] > a[parsedSql.orderBy[0]]
                            ? 1
                            : -1;
                    }
                });
            }
            if (parsedSql.offset) {
                result = result.slice(parsedSql.offset);
            }
            if (parsedSql.limit) {
                result = result.slice(0, parsedSql.limit);
            }
            return result;
        }).flat();
    }
    run(query) {
        return JsSql.run(this.data, query);
    }
    constructor(db) {
        this.data = db;
    }
}

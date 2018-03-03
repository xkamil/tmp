export const sortBy = (data, orderBy, order) => {
    let dataCopy = JSON.parse(JSON.stringify(data));

    dataCopy.sort((a, b) => {
        if (a[orderBy] < b[orderBy]) {
            return -1 * order;
        } else if (b[orderBy] < a[orderBy]) {
            return 1 * order;
        }
        return 0;
    });

    return dataCopy;
};
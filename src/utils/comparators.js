export const areEqual = (obj1, obj2) => {
    let equal = true;

    if (obj1 && obj2) {
        Object.getOwnPropertyNames(obj1).forEach((property) => {
            if (!obj2.hasOwnProperty(property) || obj2[property] !== obj1[property]) {
                equal = false;
            }
        });
    }

    return equal;
};

export const areEqualDeep = (obj1, obj2) => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
};
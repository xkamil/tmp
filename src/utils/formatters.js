export const formatCamelCased = (camelCased) => {
    let output = '';

    for (let i = 0; i < camelCased.length; i++) {
        if (camelCased.charAt(i).toUpperCase() === camelCased.charAt(i)) {
            output += ' ' + camelCased.charAt(i).toLowerCase();
        } else {
            output += camelCased.charAt(i)
        }
    }

    return output.charAt(0).toUpperCase() + output.slice(1);
};

export const formatUnderscored = (underscored) => {
    underscored = underscored.replace(/_/, ' ');
    return underscored.charAt(0).toUpperCase() + underscored.slice(1);
};

export const timestampToDate = (timestamp) => {
    const date = new Date(timestamp);

    const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

    return `${hours}:${minutes}:${seconds}`;
};

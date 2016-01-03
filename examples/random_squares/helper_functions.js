const randomColor = function() {
    const r = 255 * Math.random() | 0;
    const g = 255 * Math.random() | 0;
    const b = 255 * Math.random() | 0;
    return `rgb(${r}, ${g}, ${b})`;
};

module.exports = {
    randomColor
};

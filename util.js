class Util {

    static getColour(category) {
        const colour = d3
            .scaleOrdinal()
            .domain(["payments", "orders", "shipping", "receipts"])
            .range(["#4682b4", "#ff00ff", "#f08080", "#20b2aa"]);
        return colour(category);
    }

    static getRandomColor() {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i += 1) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

}

export {Util}
fs = require('fs');

makeSpacesAfterCapitalLetters = function (text) {
    return text.replace(/([A-Z])/g, function (letter) {
        return " " + letter;
    }).replace(/\b(.)/ig, function (letter) {
        return letter[0].toUpperCase();
    });
};

let output_parameters = "";
let output_header = "*";

fs.readFile('parameters.txt', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    let lines = data.split("\n");
    let module = "UnknowModule";
    if (lines[0].match(/(.+)\.(.+)\s*=\s*(.+);/i)) {
        module = RegExp.$1;
    }
    console.log("Module name: ", module);
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        line = line.replace(module, "#");
        if (line.match(/\#\.(.+)\s*=\s*(.+)/i)) {
            let name = RegExp.$1;
            let result = RegExp.$2;
            let readableName = "";
            let description = "...";
            let output_end = "";
            if (result.match(/\/\/\s*\((.*)\)\s*:\s*(.*)/i)) {
                readableName = RegExp.$1;
                description = RegExp.$2;
                output_end = "\t//\t(" + readableName + "): " + description;
                if (readableName.length <= 0)
                    readableName = makeSpacesAfterCapitalLetters(name);
                if (description.length <= 0)
                    description = "...";
            } else {
                readableName = makeSpacesAfterCapitalLetters(name);
            }
            result = result.replace(";", "").replace(/\/\/(.+)/ig, "");

            result = result.trim().replace(/\"/ig, "");
            readableName = readableName.trim();
            name = name.trim();

            var output_result = "";
            if (result === "true" || result === "false") {
                output_result = "String(parameters[\"" + readableName + "\"] || '" + result + "') === 'true'";
            } else if (!isNaN(result)) {
                output_result = "Number(parameters[\"" + readableName + "\"] || " + result + ")";
            } else if (result.match(/String\((.+)\)/) || result.match(/Number\((.+)\)/)) {
                output_result = result;
            } else {
                output_result = "String(parameters[\"" + readableName + "\"] || \"" + result + "\")";
            }
            output_parameters += module + "." + name + " = " + output_result + ";" + output_end + "\n";

            output_header += "\n* @param " + readableName + "\n* @desc " + description + "\n* @default " + result + "\n*";
        } else if (line.match(/\/\/\s*divider\s*:\s*(.+)/i)) {
            output_header += "\n* @param " + RegExp.$1 + "\n* @desc " + "..." + "\n* @default \n*";
            output_parameters += line;
        } else {
            output_parameters += "\n";
        }
    }

    fs.writeFile('output_parameters.txt', output_parameters, 'utf8', function (err) {
        if (err) throw err;
        console.log("Parameters generated in output_parameters.txt");
    });

    fs.writeFile('output_header.txt', output_header, 'utf8', function (err) {
        if (err) throw err;
        console.log("Header generated in output_header.txt");
    });
});
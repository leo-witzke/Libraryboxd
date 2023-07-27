function countOnes(binaryNumber) {
    let count = 0;
    for (let i = 0; i < ((Math.log(binaryNumber)/Math.log(2)) + 1); i++) {
        if ((binaryNumber & (1 << i)) != 0) {
            count++;
        }
    }
    return count;
}

function similarity(word_one, word_two) {
    word_one = word_one.toLowerCase();
    word_two = word_two.toLowerCase();
    let smaller_word = word_one;
    let larger_word = word_two;
    if (word_one.length > word_two.length) {
        smaller_word = word_two;
        larger_word = word_one;
    }
    let comparisonBits = Array();
    for (let i = 0; i < smaller_word.length+larger_word.length-1; i++) {
        let comparison = 0;
        for (let j = 0; j < smaller_word.length; j++) {
            // j - smaller word
            // i+j-smaller_word.length+1 - larger word
            const smaller_word_index = j;
            const larger_word_index = i+j-smaller_word.length+1;
            if (0 <= larger_word_index && larger_word_index < larger_word.length) {
                if (smaller_word[smaller_word_index] == larger_word[larger_word_index]) {
                    comparison = comparison | (1 << j);
                }
            }
        }
        comparisonBits.push(comparison);
    }
    let maxSimilarity = 0;
    comparisonBits = comparisonBits.filter(comparison => {return comparison != 0 && countOnes(comparison) > 1}).sort((c1,c2) => {return (countOnes(c2) - countOnes(c1))}).slice(0,10);
    for (let power_set = 0; power_set < 2**comparisonBits.length; power_set++) {
        let numberOfSimilarities = 0;
        let combinedSimilarity = 0;
        for (let set_index = 0; set_index < comparisonBits.length; set_index++) {
            if ((power_set & (1 << set_index)) != 0) {
                numberOfSimilarities++;
                combinedSimilarity = combinedSimilarity | comparisonBits[set_index]
            }
        }
        maxSimilarity = Math.max((countOnes(combinedSimilarity) - numberOfSimilarities + 1), maxSimilarity);
    }
    return maxSimilarity/larger_word.length;
    // return maxSimilarity/(smaller_word.length+((larger_word.length-smaller_word.length)**0.5));
}

function levenshteinDistance(str1, str2) {
    const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) {
        track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
        track[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator, // substitution
            );
        }
    }
    return track[str2.length][str1.length];
};

function editSimilarity(str1, str2) {
    return 1-(levenshteinDistance(str1, str2)/(str1.length+str2.length))
}

const fs = require('fs');

const testCases = fs.readFileSync('similarity-test-cases.csv', 'utf-8');
testCases.split(/\r?\n/).forEach(line => {
    const split = line.split("/");
    const title = split[0];
    const itemTitle = split[1];
    const itemSubtitle = split[2];
    console.log(Math.max(editSimilarity(title.toLowerCase(), itemTitle.toLowerCase()), editSimilarity(title.toLowerCase(), (itemTitle+" "+itemSubtitle).toLowerCase())), title+" | "+itemTitle+" | "+itemSubtitle);
}); 

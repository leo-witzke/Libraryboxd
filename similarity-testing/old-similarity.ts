function countOnes(binaryNumber: number): number {
    let count = 0;
    for (let i = 0; i < ((Math.log(binaryNumber)/Math.log(2)) + 1); i++) {
        if ((binaryNumber & (1 << i)) != 0) {
            count++;
        }
    }
    return count;
}

export function similarity(word_one: string, word_two: string): number {
// function similarity(word_one: string, word_two: string): number {
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
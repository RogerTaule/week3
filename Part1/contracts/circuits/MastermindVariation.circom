pragma circom 2.0.3;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";

template MastermindVariation() {
   // Public inputs
    signal input pubGuess1;
    signal input pubGuess2;
    signal input pubGuess3;

    signal input pubNumHit;
    signal input pubNumBlow;
    signal input pubSolnHash;

    // Private inputs
    signal input privSoln1;
    signal input privSoln2;
    signal input privSoln3;
    signal input privSalt;

    // Output
    signal output solnHashOut;

    var guess[3] = [pubGuess1, pubGuess2, pubGuess3];
    var soln[3] =  [privSoln1, privSoln2, privSoln3];
    var j = 0;
    var k = 0;
    component lessThan[6];
    component equalGuess[8];
    component equalSoln[8];
    var equalIdx = 0;

    // Create a constraint that the solution and guess digits are all less than 10.
    for (j=0; j<3; j++) {
        lessThan[j] = LessThan(5);
        lessThan[j].in[0] <== guess[j];
        lessThan[j].in[1] <== 25;
        lessThan[j].out === 1;
        lessThan[j+3] = LessThan(5);
        lessThan[j+3].in[0] <== soln[j];
        lessThan[j+3].in[1] <== 25;
        lessThan[j+3].out === 1;
        for (k=j+1; k<3; k++) {
            // Create a constraint that the solution and guess digits are unique. no duplication.
            equalGuess[equalIdx] = IsEqual();
            equalGuess[equalIdx].in[0] <== guess[j];
            equalGuess[equalIdx].in[1] <== guess[k];
            equalGuess[equalIdx].out === 0;
            equalSoln[equalIdx] = IsEqual();
            equalSoln[equalIdx].in[0] <== soln[j];
            equalSoln[equalIdx].in[1] <== soln[k];
            equalSoln[equalIdx].out === 0;
            equalIdx += 1;
        }
    }

    // Count hit & blow
    var hit = 0;
    var blow = 0;
    component equalHB[9];

    for (j=0; j<3; j++) {
        for (k=0; k<3; k++) {
            equalHB[3*j+k] = IsEqual();
            equalHB[3*j+k].in[0] <== soln[j];
            equalHB[3*j+k].in[1] <== guess[k];
            blow += equalHB[3*j+k].out;
            if (j == k) {
                hit += equalHB[3*j+k].out;
                blow -= equalHB[3*j+k].out;
            }
        }
    }

    // Create a constraint around the number of hit
    component equalHit = IsEqual();
    equalHit.in[0] <== pubNumHit;
    equalHit.in[1] <== hit;
    equalHit.out === 1;
    
    // Create a constraint around the number of blow
    component equalBlow = IsEqual();
    equalBlow.in[0] <== pubNumBlow;
    equalBlow.in[1] <== blow;
    equalBlow.out === 1;

    // Verify that the hash of the private solution matches pubSolnHash
    component poseidon = Poseidon(4);
    poseidon.inputs[0] <== privSalt;
    poseidon.inputs[1] <== privSoln1;
    poseidon.inputs[2] <== privSoln2;
    poseidon.inputs[3] <== privSoln3;

    solnHashOut <== poseidon.out;
    pubSolnHash === solnHashOut;
 }

 component main {public [pubGuess1, pubGuess2, pubGuess3, pubNumHit, pubNumBlow, pubSolnHash]} = MastermindVariation();
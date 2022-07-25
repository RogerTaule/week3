//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected

const { expect, assert } = require("chai");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);
const { BigNumber } = require("ethers");
const { buildPoseidon } = require("circomlibjs");



describe("MastermindVariation", function () {
    this.timeout(100000000);
    let Verifier;
    let verifier;
    let poseidon;
    let circuit;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();

        circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        poseidon =  await buildPoseidon();
    });

    it("Circuit returns correct number of hit and blow", async function () {
       
        const guess = [444, 0, 23, 9];
        const hash = BigNumber.from(poseidon.F.toObject(poseidon(guess)));
        
        const INPUT = {
            "pubSolnHash": hash,
            "pubGuess1": 23,
            "pubGuess2": 7,
            "pubGuess3": 9,
            "pubNumHit": 1,
            "pubNumBlow": 1,
            "privSoln1": 0,
            "privSoln2": 23,
            "privSoln3": 9,
            "privSalt": 444
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(5004980421847786928530313861547727672039001312552586098193283482939648079471n)));

    });

    it("Circuit to be reverted if number of hits doesn't match  ", async function () {

        const guess = [444, 0, 23, 9];
        const hash = BigNumber.from(poseidon.F.toObject(poseidon(guess)));

        const INPUT = {
            "pubSolnHash": hash,
            "pubGuess1": 23,
            "pubGuess2": 7,
            "pubGuess3": 9,
            "pubNumHit": 0,
            "pubNumBlow": 1,
            "privSoln1": 0,
            "privSoln2": 23,
            "privSoln3": 9,
            "privSalt": 444
        }

        expect(circuit.calculateWitness(INPUT, true)).to.be.reverted;

    });

    it("Circuit to be reverted if number of blows doesn't match  ", async function () {

        const guess = [444, 0, 23, 9];
        const hash = BigNumber.from(poseidon.F.toObject(poseidon(guess)));

        const INPUT = {
            "pubSolnHash": hash,
            "pubGuess1": 23,
            "pubGuess2": 7,
            "pubGuess3": 9,
            "pubNumHit": 1,
            "pubNumBlow": 0,
            "privSoln1": 0,
            "privSoln2": 23,
            "privSoln3": 9,
            "privSalt": 444
        }

        expect(circuit.calculateWitness(INPUT, true)).to.be.reverted;

    });

    it("Circuit to be reverted if number is higher than 25 in guess", async function () {

        const guess = [444, 0, 25, 9];
        const hash = BigNumber.from(poseidon.F.toObject(poseidon(guess)));

        const INPUT = {
            "pubSolnHash": hash,
            "pubGuess1": 23,
            "pubGuess2": 7,
            "pubGuess3": 9,
            "pubNumHit": 1,
            "pubNumBlow": 1,
            "privSoln1": 0,
            "privSoln2": 25,
            "privSoln3": 9,
            "privSalt": 444
        }

        expect(circuit.calculateWitness(INPUT, true)).to.be.reverted;

    });

    it("Circuit to be reverted if number is higher than 25 in solution", async function () {

        const guess = [444, 0, 25, 9];
        const hash = BigNumber.from(poseidon.F.toObject(poseidon(guess)));

        const INPUT = {
            "pubSolnHash": hash,
            "pubGuess1": 27,
            "pubGuess2": 7,
            "pubGuess3": 9,
            "pubNumHit": 1,
            "pubNumBlow": 1,
            "privSoln1": 0,
            "privSoln2": 25,
            "privSoln3": 9,
            "privSalt": 444
        }

        expect(circuit.calculateWitness(INPUT, true)).to.be.reverted;

    });

    it("Circuit to be reverted if number is duplicated in guess", async function () {

        const guess = [444, 25, 25, 9];
        const hash = BigNumber.from(poseidon.F.toObject(poseidon(guess)));

        const INPUT = {
            "pubSolnHash": hash,
            "pubGuess1": 23,
            "pubGuess2": 7,
            "pubGuess3": 9,
            "pubNumHit": 1,
            "pubNumBlow": 1,
            "privSoln1": 25,
            "privSoln2": 25,
            "privSoln3": 9,
            "privSalt": 444
        }

        expect(circuit.calculateWitness(INPUT, true)).to.be.reverted;

    });

    it("Circuit to be reverted if number is duplicated in solution", async function () {

        const guess = [444, 25, 25, 9];
        const hash = BigNumber.from(poseidon.F.toObject(poseidon(guess)));

        const INPUT = {
            "pubSolnHash": hash,
            "pubGuess1": 23,
            "pubGuess2": 9,
            "pubGuess3": 9,
            "pubNumHit": 1,
            "pubNumBlow": 1,
            "privSoln1": 23,
            "privSoln2": 25,
            "privSoln3": 9,
            "privSalt": 444
        }

        expect(circuit.calculateWitness(INPUT, true)).to.be.reverted;

    });

    
})
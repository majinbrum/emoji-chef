import { GoogleGenerativeAI } from "@google/generative-ai";
import { API_KEY } from "./keys.js";

/*-----------
    ELEMENTS 
    ------------*/

// Store elements in variables
const ingredients = document.querySelectorAll(".ingredient");
const bowlSlots = document.querySelectorAll(".bowl-slot");
const cookBtn = document.querySelector("#cook-btn");
const loading = document.querySelector(".loading");
const loadingMessage = document.querySelector(".loading-message");
const modal = document.querySelector(".modal");
const modalContent = document.querySelector(".modal-content");
const modalCloseBtn = document.querySelector(".modal-close");

// Init bowl state
let bowl = [];

/*-----------
    EVENTS 
    ------------*/

// Create recipe event
cookBtn.addEventListener("click", createRecipe);

// Modal close event
modalCloseBtn.addEventListener("click", function () {
	modal.classList.add("hidden");
});

// Ingredient click event
ingredients.forEach(function (el) {
	el.addEventListener("click", function () {
		addIngredient(el.innerText);
	});
});

/*-----------
    FUNCTIONS 
    ------------*/

// function definitions
function addIngredient(ingredient) {
	const bowlMaxSlots = bowlSlots.length;

	if (bowl.length === bowlMaxSlots) {
		bowl.shift();
	}

	bowl.push(ingredient);

	bowlSlots.forEach(function (el, i) {
		let ingredient = "?";

		if (bowl[i]) {
			ingredient = bowl[i];
		}

		el.innerText = ingredient;
	});

	if (bowl.length === bowlMaxSlots) {
		cookBtn.classList.remove("hidden");
	}
}

async function createRecipe() {
	loading.classList.remove("hidden");
	loadingMessage.innerText = getRandomLoadingMessage();

	const messageInterval = setInterval(() => {
		loadingMessage.innerText = getRandomLoadingMessage();
	}, 2000);

	if (API_KEY) {
		const genAI = new GoogleGenerativeAI(API_KEY);
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

		const prompt = `\
Create a recipe with these ingredients: ${bowl.join(", ")}.
The recipe should be easy and have a creative and fun title.
For the instructions, don't use a numbered list; write them in a narrative style.
Your responses should be in JSON format only, like this example, but do not use markdown language:

###

{
    "title": "Recipe title",
    "ingredients": "1 egg and 1 tomato",
    "instructions": "mix the ingredients and put in the oven."
}

###`;

		const recipeResponse = await model.generateContent(prompt);
		const content = JSON.parse(recipeResponse.response.candidates[0].content.parts[0].text);
		console.log("content", content);

		modalContent.innerHTML = `\
<h2>${content.title}</h2>
<p>${content.ingredients}</p>
<p>${content.instructions}</p>`;
	} else {
		modalContent.innerHTML = `\
<h2>Avocado, Egg, and Cheese Cloud Toast</h2>
<p>1 slice of bread, 1 egg, 1/4 avocado, 1 slice of cheese (your favorite kind)</p>
<p>Toast the bread until golden brown. While the bread is toasting, mash the avocado with a fork. Once the bread is toasted, spread the mashed avocado on top. Crack the egg into a small bowl and whisk it with a fork. Pour the whisked egg over the avocado, then top with the cheese. Place the toast under the broiler until the cheese is melted and bubbly. Let cool for a minute or two before digging in! Enjoy the savory, cloud-like texture of the egg!</p>`;
	}
	modal.classList.remove("hidden");
	loading.classList.add("hidden");
	clearInterval(messageInterval);

	clearBowl();
}

function clearBowl() {
	bowl = [];

	bowlSlots.forEach(function (slot) {
		slot.innerText = "?";
	});
}

function getRandomLoadingMessage() {
	const messages = [
		"Preparing the ingredients...",
		"Heating the stove...",
		"Mixing in the bowl...",
		"Taking photos for Instagram...",
		"Grabbing the ladle...",
		"Putting on the apron...",
		"Washing my hands...",
		"Peeling the vegetables...",
		"Cleaning the countertop...",
	];

	const randIdx = Math.floor(Math.random() * messages.length);
	return messages[randIdx];
}

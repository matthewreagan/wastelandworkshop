var upgrades;
var bos;
var survivors;
var mutants;
var characters;

var forceSection;
var addButton;
var addSection;
var capsSection;

var lastTextFieldValue;

var totalCaps;

function getUrl(url){
	var req = new XMLHttpRequest();
	req.open("GET",url,true);
	return req;
}

function loadURL(url){
	var req = getUrl(url);
	req.send();
	return new Promise(function(resolve, reject) {
		req.onreadystatechange = function() {
			if(req.readyState === 4)
			{
				if(req.status === 200)
				{
					resolve(JSON.parse(req.response));
				}else{
					reject();
				}
			}
		}
	});
}

function upgradesLoaded(json)
{
	upgrades = json;
	var bosLoadPromise = loadURL("data/brotherhood_of_steel.json");
	bosLoadPromise.then(bosLoaded);
	bosLoadPromise.catch(function(){alert("bos load failed");});
}

function bosLoaded(json){
	bos = json;
	var survivorLoadPromise = loadURL("data/survivors.json");
	survivorLoadPromise.then(survivorsLoaded);
	survivorLoadPromise.catch(function(){alert("survivor load failed");});
}

function survivorsLoaded(json){
	survivors = json;
	var mutantLoadPromise = loadURL("data/super_mutants.json");
	mutantLoadPromise.then(mutantsLoaded);
	mutantLoadPromise.catch(function(){alert("mutants load failed");});
}

function mutantsLoaded(json){
	mutants = json;
	initListeners();
}

function initListeners(){
	document.getElementById("switch-bos").addEventListener("click", switchBos, true);
	document.getElementById("switch-mutants").addEventListener("click", switchMutants, true);
	document.getElementById("switch-survivors").addEventListener("click", switchSurvivors, true);

	forceSection = document.getElementById("force");
	addSection = document.getElementById("addSection");
	addButton = document.getElementById("addButton");
	capsSection = document.getElementById("caps");
	addButton.addEventListener("click", openAddSection);

	switchBos();
}

function switchBos() {
	characters = bos;
	clearForce();
}

function switchMutants() {
	characters = mutants;
	clearForce();
}

function switchSurvivors() {
	characters = survivors;
	clearForce();
}

function clearForce(){
	forceSection.innerHTML = "";
	addSection.innerHTML = "";
	var list = document.createElement("ul");
	characters.forEach(function(characterElement){
		var para = document.createElement("li");
		var button = document.createElement("button");
		button.setAttribute("class", "btn btn-primary");
		var nameNode = document.createTextNode(characterElement.name);
		var pointsNode = document.createTextNode("(" + characterElement.cost + ")");
		button.addEventListener("click", function() { addCharacter(characterElement);});
		button.appendChild(nameNode);
		button.appendChild(pointsNode);
		para.appendChild(button);
		list.appendChild(para);
	});
	var close = document.createElement("button");
	close.setAttribute("class", "btn btn-primary");
	var closeButton = document.createTextNode("X");
	close.addEventListener("click", closeAddSection);
	close.appendChild(closeButton);
	addSection.appendChild(close);
	addSection.appendChild(list);
	closeAddSection();
	totalCaps = 0;
	updateCaps();
}

function closeAddSection(){
	addSection.style.display = "none";
	addButton.style.display = "block";
}

function openAddSection(){
	addButton.style.display = "none";
	addSection.style.display = "block";
}

function getUpgrade(elementType, elementName){
	if(upgrades[elementType] == null){
		return null;
	}
	var toReturn = null;
	upgrades[elementType].forEach(function(element){
		if(element.name == elementName){
			toReturn = element;
		}
	});
	return toReturn;
}

function addCharacter(characterElement){
	var charaSection = document.createElement("div");
	charaSection.setAttribute("class", "characterElement");
	
	var headerSection = document.createElement("div");
	headerSection.setAttribute("class", "row");
	
	var close = document.createElement("button");
	var closeButton = document.createTextNode("X");
	close.setAttribute("class", "btn btn-danger");
	close.appendChild(closeButton);

	var nameSection = document.createElement("h1");
	nameSection.setAttribute("class", "col-sm-6 float-left");
	var name = document.createTextNode(characterElement.name);
	nameSection.appendChild(name);
	headerSection.appendChild(nameSection);

	var costSection = document.createElement("div");
	var cost = document.createTextNode(characterElement.cost);
	costSection.appendChild(cost);
	costSection.appendChild(document.createTextNode(" + Equipment: "));
	var equipmentCost = document.createElement("span");
	equipmentCost.innerHTML = "0";
	costSection.appendChild(equipmentCost);
	costSection.setAttribute("class", "col-sm-3 float-left");
	headerSection.appendChild(costSection);

	var copy = document.createElement("button");
	var copyButton = document.createTextNode("+");
	copy.setAttribute("class", "btn btn-primary");
	copy.appendChild(copyButton);
	headerSection.appendChild(copy);
	copy.addEventListener("click", function() {
		alert("Don't copy that floppy!");
	});

	headerSection.appendChild(close);

	charaSection.appendChild(headerSection);

	var specialSection = document.createElement("div");
	specialSection.setAttribute("class", "row");

	if(characterElement.heroic){
		var heroicSection = document.createElement("div");
		heroicSection.setAttribute("class", "col-sm-2 float-left");
		var heroicCheckBox = document.createElement('input');
		heroicCheckBox.type = 'checkbox';
		var heroicCostSection = document.createElement("p");
		var heroicDescription = document.createTextNode("Heroic:");
		heroicSection.appendChild(heroicDescription);
		heroicSection.appendChild(heroicCheckBox);
		heroicSection.appendChild(heroicCostSection);
		heroicCheckBox.addEventListener("click", function(){
			if(heroicCheckBox.checked){
				totalCaps += upgrades.heroes_and_leaders[0].cost; //Heroic is the first entry
				heroicCostSection.innerHTML = "+" + upgrades.heroes_and_leaders[0].cost;
				updateCaps();
			}else{
				totalCaps -= upgrades.heroes_and_leaders[0].cost; //Heroic is the first entry
				updateCaps();
				heroicCostSection.innerHTML = "";
			}
		});
		specialSection.appendChild(heroicSection);
	}

	if(characterElement.must_wear){
		var mustWearSection = document.createElement("div");
		mustWearSection.setAttribute("class", "col-sm-5 float-left");
		characterElement.must_wear.forEach(function(element){
			var elements = element.split(".");
			var upgrade = getUpgrade(elements[0], elements[1]);
			if(upgrade == null){
				alert("No upgrade " + elements[1] + " of type " + elements[0] + " found");
			}else{
				var mustWearElement = document.createElement("div");
				var mustWearDescription = document.createTextNode(elements[1]);
				mustWearElement.appendChild(mustWearDescription);
				mustWearSection.appendChild(mustWearElement);
			}
		});
		specialSection.appendChild(mustWearSection);
	}
	if(characterElement.must_carry){
		var mustCarrySection = document.createElement("div");
		mustCarrySection.setAttribute("class", "col-sm-5 float-left");
		characterElement.must_carry.forEach(function(element){
			var elements = element.split(".");
			var upgrade = getUpgrade(elements[0], elements[1]);
			if(upgrade == null){
				alert("No upgrade " + elements[1] + " of type " + elements[0] + " found");
			}else{
				var mustCarryElement = document.createElement("div");
				var mustCarryDescription = document.createTextNode(elements[1]);
				mustCarryElement.appendChild(mustCarryDescription);
				mustCarrySection.appendChild(mustCarryElement);
			}
		});
		specialSection.appendChild(mustCarrySection);
	}

	charaSection.appendChild(specialSection);

	if(characterElement.carry_slots != null || characterElement.consumables != null){
		var equipmentToggle = document.createElement("div");
		equipmentToggle.setAttribute("class", "row");
		
		var showEquipment = document.createElement("button");
		showEquipment.setAttribute("class", "btn btn-primary");
		showEquipment.appendChild(document.createTextNode("Show Equipment"));
		equipmentToggle.appendChild(showEquipment);
		showEquipment.style.display = "none";

		var hideEquipment = document.createElement("button");
		hideEquipment.setAttribute("class", "btn btn-primary");
		hideEquipment.appendChild(document.createTextNode("Hide Equipment"));
		equipmentToggle.appendChild(hideEquipment);

		charaSection.appendChild(equipmentToggle);
		var equipmentSection = document.createElement("div");
		equipmentSection.setAttribute("class", "grid-container");
	}

	if(characterElement.carry_slots != null){
		Object.keys(characterElement.carry_slots).forEach(function (slotType) {
			var carrySection = document.createElement("div");
			carrySection.setAttribute("class", "grid-item");
			var carryHeader = document.createElement("h2");
			var carryHeaderText = document.createTextNode(slotType);
			carryHeader.appendChild(carryHeaderText);
			carrySection.appendChild(carryHeader);
			var slotOption = characterElement.carry_slots[slotType];
			slotOption.forEach(function(option) {
				var optionElement = getUpgrade(slotType, option);
				var optionSection = document.createElement("div");
				var optionNameSection = document.createElement("span");
				optionNameSection.appendChild(document.createTextNode(optionElement.name));
				var optionCostSection = document.createElement("span");
				optionCostSection.appendChild(document.createTextNode(optionElement.cost));
				var optionCheckBox = document.createElement('input');
				optionCheckBox.type = 'checkbox';
				optionSection.appendChild(optionNameSection);
				optionSection.appendChild(optionCostSection);
				optionSection.appendChild(optionCheckBox);
				
				optionCheckBox.addEventListener("click", function(){
				if(optionCheckBox.checked){
					totalCaps += optionElement.cost;
					equipmentCost.innerHTML = parseInt(equipmentCost.innerHTML) + optionElement.cost
					updateCaps();
				}else{
					totalCaps -= optionElement.cost;
					equipmentCost.innerHTML = parseInt(equipmentCost.innerHTML) - optionElement.cost
					updateCaps();
				}
			});

				carrySection.appendChild(optionSection);
			});
			equipmentSection.appendChild(carrySection);
		});
	}

	if(characterElement.consumables != null){
		Object.keys(characterElement.consumables).forEach(function (slotType) {
			var consumeableSection = document.createElement("div");
			consumeableSection.setAttribute("class", "grid-item");
			var consumeableHeader = document.createElement("h2");
			var consumeableHeaderText = document.createTextNode(slotType);
			consumeableHeader.appendChild(consumeableHeaderText);
			consumeableSection.appendChild(consumeableHeader);

			var slotOption = characterElement.consumables[slotType];
			slotOption.forEach(function(option) {
				var optionElement = getUpgrade(slotType, option);
				var optionSection = document.createElement("div");
				var optionNameSection = document.createElement("p");
				optionNameSection.appendChild(document.createTextNode(optionElement.name));
				var optionCostSection = document.createElement("p");
				optionCostSection.appendChild(document.createTextNode(optionElement.cost));
				optionCostSection.appendChild(document.createTextNode(" X"));

				var optionIncreaseCount = document.createElement("button");
				optionIncreaseCount.setAttribute("class", "btn btn-primary");
				optionIncreaseCount.appendChild(document.createTextNode("+"));
				optionIncreaseCount.addEventListener("click", function(){
					var value = parseInt(optionInput.value);
					if(isNaN(value)){
						optionInput.value = "0";
					}else{
						optionInput.value = value + 1;
						totalCaps += optionElement.cost;
						equipmentCost.innerHTML = parseInt(equipmentCost.innerHTML) + optionElement.cost;
						updateCaps();
					}
				});

				var optionDecreaseCount = document.createElement("button");
				optionDecreaseCount.setAttribute("class", "btn btn-primary");
				optionDecreaseCount.appendChild(document.createTextNode("-"));
				optionDecreaseCount.addEventListener("click", function(){
					var value = parseInt(optionInput.value);
					if(isNaN(value)){
						optionInput.value = "0";
					}else if(value > 0){
						optionInput.value = value - 1;
						totalCaps -= optionElement.cost;
						equipmentCost.innerHTML = parseInt(equipmentCost.innerHTML) - optionElement.cost;
						updateCaps();
					}
				});

				var optionInput = document.createElement('input');
				optionInput.type = 'text';
				optionInput.value = "0";
				optionInput.addEventListener("focusin", function(){
					var value = parseInt(optionInput.value);
					if(isNaN(value)){
						lastTextFieldValue = 0;
					}else{
						lastTextFieldValue = value;
					}
				})
				optionInput.addEventListener("change", function(){
					var value = parseInt(optionInput.value);
					if(isNaN(value)){
						optionInput.value = lastTextFieldValue;
					}else{
						if(value < lastTextFieldValue){
							value = 0;
							optionInput.value = "0";
						}
						totalCaps += (value - lastTextFieldValue) * optionElement.cost;
						equipmentCost.innerHTML = parseInt(equipmentCost.innerHTML) + (value - lastTextFieldValue) * optionElement.cost;
						updateCaps();
					}
				});

				optionCostSection.appendChild(optionIncreaseCount);
				optionCostSection.appendChild(optionInput);
				optionCostSection.appendChild(optionDecreaseCount);

				optionSection.appendChild(optionNameSection);
				optionSection.appendChild(optionCostSection);
				consumeableSection.appendChild(optionSection);
			});

			equipmentSection.appendChild(consumeableSection);
		});
	}

	if(characterElement.carry_slots != null || characterElement.consumables != null){
		showEquipment.addEventListener("click", function() {
			showEquipment.style.display = "none";
			equipmentSection.style.display = "flex";
			hideEquipment.style.display = "block";
		});
		hideEquipment.addEventListener("click", function() {
			equipmentSection.style.display = "none";
			showEquipment.style.display = "block";
			hideEquipment.style.display = "none";
		});
		charaSection.appendChild(equipmentSection);
	}

	close.addEventListener("click", function() 
		{
			forceSection.removeChild(charaSection);
			var heroicCost = 0; 
			if(heroicCheckBox != null && heroicCheckBox.checked){
				heroicCost = upgrades.heroes_and_leaders[0].cost;
			}
			totalCaps -= (characterElement.cost + parseInt(equipmentCost.innerHTML) + heroicCost);
			updateCaps();
		}
	);

	forceSection.appendChild(charaSection);

	totalCaps += characterElement.cost;
	updateCaps();
}

function updateCaps(){
	capsSection.innerHTML = totalCaps;
	/*
	var url = window.location.href;  
	var urlSplit = url.split( "?" ); 
	window.location.href = urlSplit[0] + '?force' + totalCaps;
	*/
}

function initialize(){
	var upgradeLoadPromise = loadURL("data/upgrades.json");
	upgradeLoadPromise.then(upgradesLoaded);
	upgradeLoadPromise.catch(function(){alert("upgrade load failed");});
}
"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const favStoryIds = currentUser.favorites.map(story => story.storyId);
  const starClass = (favStoryIds.includes(story.storyId)) ? "fa-solid" : "fa-regular";

  // console.log(favStoryIds, starClass);

  return $(`
      <li id="${story.storyId}" data-story-id="${story.storyId}">
      <span class="star">
        <i class="${starClass} fa-star"></i>
      </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

function putFavsOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $("#favorites-container").append($story);
  }
}


/**Gets data from the submit story form, calls addStory, and appends new story
 * on the page.
 */

$newStoryForm.on("submit", handleNewStory);

/**
 * Uses story form inputs and created story to generate the story markup
 * and prepend the story to the DOM.
 * Also clears the form inputs and prevents page refresh.
*/
async function handleNewStory(evt) {
  evt.preventDefault();
  let formData = retrieveStoryFormInputs();
  let createdStory = await storyList.addStory(currentUser, formData);

  const $story = generateStoryMarkup(createdStory);
  $allStoriesList.prepend($story);
  $newStoryForm.trigger("reset").hide();

}

/**
 * Retrieves the inputs from the story form and returns them as a formData variable.
*/
function retrieveStoryFormInputs() {
  let title = $("#title").val();
  let author = $("#author").val();
  let url = $("#url").val();
  let formData = { title, author, url };
  console.log(formData);
  return formData;
}

$allStoriesList.on("click", ".star", favoriteStory);

/**
 * Adds and removes favorite stories for the current user.
 *Conductor function.
 */
async function favoriteStory(evt) {
  const favsArray = currentUser.favorites;
  const $favStory = $(evt.target).closest("li");
  const favStoryId = $favStory.data("story-id");
  const favStoryInstance = await Story.getStoryById(favStoryId);
  //console.log("Star Clicked!", favStoryId);

  //this checks if the the clicked story is already in favorites array
  for (let i = 0; i < favsArray.length; i++) {
    if (currentUser.favorites[i].storyId === favStoryInstance.storyId) {
      await currentUser.deleteFavStory(currentUser, favStoryInstance);
      toggleStar(true, evt.target);
      currentUser.favorites.splice(i, 1);
      return;
    }
  }
  //if we reach end of loop, add the clicked story to the favorite array
  await currentUser.addFavStory(currentUser, favStoryInstance);
  currentUser.favorites.push(favStoryInstance);
  //toggle star true.
  toggleStar(false, evt.target);

  //console.log(evt.target);
}

function toggleStar(isFav, evttarget) {
  if (isFav) {
    $(evttarget)
      .closest(".fa-star")
      .removeClass("fa-solid")
      .addClass("fa-regular");
  } else {
    $(evttarget)
      .closest(".fa-star")
      .removeClass("fa-regular")
      .addClass("fa-solid");
  }
}
//things we need: username, token, storyid
//create nav bar link, create the star button, create event listener
//on the star, which will be the function sending the favorited item
//post request to the api to update the user favorites array.

//the function will take in the currentuser, the event listener has
//to pull the storyid when it's clicked (using event.target)

//later, we'll have to do the same thing in reverse. possibly in the same function
//but just delete.
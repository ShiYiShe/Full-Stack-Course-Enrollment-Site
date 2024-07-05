/*
 * Name: Fengyi Sun and Yi Shi
 * Date: May 4, 2024
 * Section: CSE 154 AC and CSE 154 AG
 *
 * This is the index.js to initially load courses and handle searching courses.
 * Courses data hard coded as global variable coursesData.
 */
'use strict';
(function() {

  window.addEventListener('load', init);

  /**
   * Initializes the task management application by adding event listeners
   * to buttons.
   */
  function init() {
    fetchCourses();
    id('grid-btn').addEventListener('click', () => {
      id('courses-container').classList.add('grid-view');
    });
    id('list-btn').addEventListener('click', () => {
      id('courses-container').classList.remove('grid-view');
    });

    id('search-btn').addEventListener('click', () => {
      fetchSearchResult();
      id('search-input').value = '';
    });

    id('all').addEventListener('click', () => {
      fetchCourses();
    });

    id('apply-btn').addEventListener('click', () => {
      fetchFilterResult();
    });

    id('login-btn').addEventListener('click', handleLoginBtn);

    id('find-btn').addEventListener('click', handleFindBtn);

    id('enrollment-btn').addEventListener('click', () => {
      handleEnrollmentBtn();
      fetchAccount();
    });

    id('login-form').addEventListener('submit', fetchLogin);
  }

  /** Handle click event of login button. */
  function handleLoginBtn() {
    id('home').classList.add('hidden');
    id('account').classList.add('hidden');
    id('login').classList.remove('hidden');
    id('login-btn').classList.add('hidden');
    id('find-btn').classList.remove('hidden');
    id('enrollment-btn').classList.remove('hidden');
  }

  /** Handle click event of find courses button. */
  function handleFindBtn() {
    id('login').classList.add('hidden');
    id('account').classList.add('hidden');
    id('home').classList.remove('hidden');
    id('find-btn').classList.add('hidden');
    id('login-btn').classList.remove('hidden');
    id('enrollment-btn').classList.remove('hidden');
  }

  /** Handle click event of enrollment button. */
  function handleEnrollmentBtn() {
    id('login').classList.add('hidden');
    id('home').classList.add('hidden');
    id('account').classList.remove('hidden');
    id('enrollment-btn').classList.add('hidden');
    id('login-btn').classList.remove('hidden');
    id('find-btn').classList.remove('hidden');
  }

  /**
   * Fetches the list of courses from database.
   */
  async function fetchCourses() {
    id("courses-container").textContent = "";
    try {
      let response = await fetch('/enroll/courses');
      await statusCheck(response);
      let data = await response.json();
      data.forEach(item => {
        let newCard = createCard(item);
        id('courses-container').appendChild(newCard);
      });
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Creates a course card element based on the provided course data.
   *
   * @param {Object} item - The course data.
   * @returns {HTMLElement} The created course card element.
   */
  function createCard(item) {
    let courseCard = gen('section');
    courseCard.classList.add('course-card');
    courseCard.id = item.name.toLowerCase().replace(/ /g, '-');

    let courseName = gen('h2');
    courseName.textContent = item.name + ": " + item.title;

    let courseInfo = displayDetail(item);
    courseInfo.classList.add('hidden');

    courseName.addEventListener("click", () => {
      courseInfo.classList.toggle('hidden');
    });

    courseCard.appendChild(courseName);
    courseCard.appendChild(courseInfo);
    return courseCard;
  }

  /**
   * Creates a detailed view of the course based on the provided course data.
   *
   * @param {Object} item - The course data.
   * @returns {HTMLElement} The created course detail element.
   */
  function displayDetail(item) {
    let courseInfo = gen('div');
    courseInfo.id = 'courseInfo';

    let description = gen('p');
    description.textContent = item.description;

    let credit = gen('p');
    credit.textContent = "Credit: " + item.credit;

    let spots = gen('p');
    spots.textContent = "Available spots: " + item.available_spot;

    let prerequisites = gen('p');
    prerequisites.textContent = "Prerequisites: " + item.prerequisites;

    let enrollBtn = gen('button');
    enrollBtn.id = "enroll" + item.id;
    enrollBtn.addEventListener('click', fetchEnrollCourse);

    enrollBtn.textContent = "Enroll";

    let wishBtn = gen('button');
    wishBtn.textContent = "Add to Wishlist";
    wishBtn.id = "wish" + item.id;
    wishBtn.addEventListener('click', fetchAddWishlist);

    courseInfo.appendChild(description);
    courseInfo.appendChild(credit);
    courseInfo.appendChild(spots);
    courseInfo.appendChild(prerequisites);
    courseInfo.appendChild(enrollBtn);
    courseInfo.appendChild(wishBtn);

    return courseInfo;
  }

  /**
   * Fetches the notification and updates the notification element with the
   * fetched data.
   */
  async function fetchNotification() {
    try {
      let response = await fetch('/enroll/notification');
      await statusCheck(response);
      let result = await response.text();
      id('notification').textContent = result;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   *
   * Based on the input in the search field and updates the courses container
   * with the fetched data.
   */
  async function fetchSearchResult() {
    let trimmedInput = id('search-input').value.trim();
    let searchURL = "/enroll/courses?search=" + trimmedInput;
    id("courses-container").textContent = "";
    try {
      let response = await fetch(searchURL);
      await statusCheck(response);
      let data = await response.json();
      data.forEach(item => {
        let newCard = createCard(item);
        id('courses-container').appendChild(newCard);
      });
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Gets the selected filter values for department, credit, and spot.
   *
   * @returns {Array} An array containing the selected department,
   * credit, and spot values.
   */
  function getFilterValuse() {
    let department;
    let credit;
    let spot = "";

    let filter1 = qsa('input[name="department"]:checked');
    if (filter1.length === 1) {
      department = filter1[0].value;
    }
    let filter2 = qsa('input[name="credit"]:checked');
    if (filter2.length === 1) {
      credit = filter2[0].value;
    }
    if (id('full').checked && !id('not-full').checked) {
      spot = "full";
    }
    if (!id('full').checked && id('not-full').checked) {
      spot = "notfull";
    }

    let result = [department, credit, spot];
    return result;
  }

  /**
   * Based on the selected filter values and updates the courses container
   * with the fetched data.
   */
  async function fetchFilterResult() {
    let values = getFilterValuse();
    let url = '/enroll/courses/filter?';
    id("courses-container").textContent = "";
    if (values[0]) {
      url += "department=" + values[0];
    }
    if (values[1]) {
      url += "&credit=" + values[1];
    }
    if (values[2]) {
      url += "&spot=" + values[2];
    }
    try {
      let response = await fetch(url);
      await statusCheck(response);
      let data = await response.json();
      data.forEach(item => {
        let newCard = createCard(item);
        id('courses-container').appendChild(newCard);
      });
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Handles the login process. Prevents the default form submission,
   * updates the UI based on the response.
   *
   * @param {Event} event - The event object from the form submission.
   */
  async function fetchLogin(event) {
    event.preventDefault();
    id('login-btn').classList.remove('hidden');
    id('find-btn').classList.add('hidden');
    let email = id('email').value;
    let password = id('password').value;
    try {
      let params = new FormData();
      params.append('email', email);
      params.append('password', password);
      let response = await fetch('/enroll/login', {
        method: "POST",
        body: params
      });
      await statusCheck(response);
      id('email').value = "";
      id('password').value = "";
      id('login').classList.add('hidden');
      id('home').classList.remove('hidden');
      fetchNotification();
    } catch (err) {
      id('login').classList.add('hidden');
      id('error').classList.remove('hidden');
      id('err-msg').textContent = err.message;
    }
  }

  /**
   * Sends a request to enroll in a course and updates the UI based on the response.
   *
   * @param {Event} event - The event object from the button click.
   */
  async function fetchEnrollCourse(event) {
    let courseId = event.target.id;
    try {
      let params = new FormData();
      params.append('id', courseId.replace(/\D/g, ''));
      let response = await fetch('/enroll/enrollcourse', {
        method: "POST",
        body: params
      });
      await statusCheck(response);
      event.target.textContent = "Enrolled";
      event.target.disabled = true;
    } catch (err) {
      id('home').classList.add('hidden');
      id('error').classList.remove('hidden');
      id('err-msg').textContent = err.message;
    }
  }

  /**
   * Sends a request to add a course to the wishlist in user's account.
   *
   * @param {Event} event - The event object from the button click.
   */
  async function fetchAddWishlist(event) {
    let courseId = event.target.id;
    try {
      let params = new FormData();
      params.append('id', courseId.replace(/\D/g, ''));
      let response = await fetch('/enroll/addwishlist', {
        method: "POST",
        body: params
      });
      await statusCheck(response);
      event.target.textContent = "Added to Wishlist";
      event.target.disabled = true;
    } catch (err) {
      id('home').classList.add('hidden');
      id('error').classList.remove('hidden');
      id('err-msg').textContent = err.message;
    }
  }

  /**
   * Fetches the account of current user's enrollment information.
   */
  async function fetchAccount() {
    try {
      let response = await fetch('/enroll/viewenrollment');
      await statusCheck(response);
      let result = await response.json();
      displayAccount(result);
    } catch (err) {
      id('account').classList.add('hidden');
      id('error').classList.remove('hidden');
      id('err-msg').textContent = err.message;
    }
  }

  /**
   * Displays the account information on the account view.
   *
   * @param {Object} data - The enrollment data.
   */
  function displayAccount(data) {
    qs('#completed li').textContent = data.completed.name + ': ' + data.completed.title;
    qs('#enrolled li').textContent = data.enrolling.name + ': ' + data.enrolling.title;
    qs('#waitinglist li').textContent = data.wishlist.name + ': ' + data.wishlist.title;
  }

  /**
   * This is a helper function to get element by id.
   * @param {id} idName - Id of an element.
   * @return {element} HTML element with idName.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * This is a helper function to get element by selector.
   * @param {selector} selector - Selector name.
   * @return {element} HTML element with selector name.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * This is a helper function to creat element.
   * @param {tag} tagName - Tag of an element.
   * @return {element} HTML element with tagName.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * Returns the first DOM element that matches the specified CSS selector.
   * @param {string} query - The CSS selector.
   * @returns {Element} - All of the matched DOM element.
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }

  /**
   * Displays an error message on the page.
   * @param {string} error - The error message to display.
   */
  function handleError(error) {
    let errorMessage = id('fetch-err');
    errorMessage.textContent = "An error occurred on the server. Error: " + error.message;
  }

  /**
   * This is an async function to check response status.
   * @param {promise} response - Promise element of fetching API.
   * @return {promise} Promise with ok status.
   */
  async function statusCheck(response) {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response;
  }

})();
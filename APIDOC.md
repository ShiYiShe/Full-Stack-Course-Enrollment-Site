# Course Enrollment API Documentation
This API is designed to manage user interactions with a course registration website. It allows users to register for courses, view available courses, and manage their course enrollment.

## Get all course data or course data matching a given search term
**Request Format:** enroll/courses

**Request Type:** GET

**Returned Data Format**: JSON

**Description 1:** Get all courses: Retrieve the list of all available courses with detailed information.

**Example Request:** enroll/courses

**Example Response:**

```json
[
  {
    "id": 1,
    "name": "CSE 121",
    "title": "Introduction to Computer Programming I",
    "credit": 4,
    "prerequisites": "None",
    "total_spot": 40,
    "available_spot": 35,
    "waitinglist": null,
    "description": "Introduction to computer programming for students without previous programming experience. Students write programs to express algorithmic thinking and solve computational problems motivated by modern societal and scientific needs. Includes procedural programming constructs (methods), control structures (loops, conditionals), and standard data types, including arrays."
  },
  {
    "id": 2,
    "name": "CSE 122",
    "title": "Introduction to Computer Programming II",
    "credit": 4,
    "prerequisites": "None",
    "total_spot": 40,
    "available_spot": 39,
    "waitinglist": null,
    "description": "Computer programming for students with some previous programming experience. Emphasizes program design, style, and decomposition. Uses data structures (e.g., lists, dictionaries, sets) to solve computational problems motivated by modern societal and scientific needs. Introduces data abstraction and interface versus implementation."
  },
  {
    "id": 3,
    "name": "CSE 123",
    "title": "Introduction to Computer Programming III",
    "credit": 4,
    "prerequisites": "None",
    "total_spot": 40,
    "available_spot": 0,
    "waitinglist": 1,
    "description": "Computer programming for students with significant previous programming experience. Emphasizes implementation and run-time analysis of data structures and algorithms using techniques including linked references, recursion, and object-oriented inheritance to solve computational problems motivated by modern societal and scientific needs."
  },
  ...
]
```
**Error Handling:**
If the server encounters an error while retrieving course data, it returns a 500 Server Error and plain text message:
`An error occurred on the server. Try again later.`

**Description 2:** Search for specific courses: retrieve a list of courses that match a given search term in their name, title, or description.

**Query Parameters:** search (optional): A string to search for in the course name, title, or description.

**Example Request 2:** /enroll/courses?search=web

**Example Response 2:**
```
[
  {
    "id": 6,
    "name": "CSE 154",
    "title": "Web Programming",
    "credit": 5,
    "prerequisites": "None",
    "total_spot": 20,
    "available_spot": 20,
    "waitinglist": null,
    "description": "Covers languages, tools, and techniques for developing interactive and dynamic web pages. Topics include page styling, design, and layout; client and server side scripting; web security; and interacting with data sources such as databases."
  },
  {
    "id": 25,
    "name": "INFO 441",
    "title": "Server-Side Development",
    "credit": 5,
    "prerequisites": "INFO 340",
    "total_spot": 20,
    "available_spot": 20,
    "waitinglist": null,
    "description": "Introduces server-side web development programming, services, tools, protocols, best practices and techniques for implementing data-driven and scalable web applications. Connects topics from human-centered design, information architecture, databases, data analytics and security to build a solution."
  }
]
```
**Error Handling:** If the search term provided in the request does not match any courses, an empty array will be returned.

## Filter courses based on credit, department, and spot availability
**Request Format:** /enroll/courses/filter

**Request Type:** GET

**Returned Data Format:** JSON

**Description:** Filter courses: Retrieve a list of courses filtered by specified criteria such as credit value, department, and availability of spots.

**Query Parameters:**
- `credit` (optional): The number of credit hours for the course. Can be `4` or `5`.
- `department` (optional): The department offering the course, matched by course name. Can be `CSE` or `INFO`
- `spot` (optional): The availability status of the course spots. Can be `full` or `notfull`.

**Example Request:** enroll/courses/filter?spot=full

**Example Response:**
```json
[
  {
    "id": 3,
    "name": "CSE 123",
    "title": "Introduction to Computer Programming III",
    "credit": 4,
    "prerequisites": "None",
    "total_spot": 40,
    "available_spot": 0,
    "waitinglist": 1,
    "description": "Computer programming for students with significant previous programming experience. Emphasizes implementation and run-time analysis of data structures and algorithms using techniques including linked references, recursion, and object-oriented inheritance to solve computational problems motivated by modern societal and scientific needs."
  },
  {
    "id": 4,
    "name": "CSE 142",
    "title": "Computer Programming I ",
    "credit": 4,
    "prerequisites": "None",
    "total_spot": 40,
    "available_spot": 0,
    "waitinglist": 2,
    "description": "Basic programming-in-the-small abilities and concepts including procedural programming (methods, parameters, return, values), basic control structures (sequence, if/else, for loop, while loop), file processing, arrays, and an introduction to defining objects. Intended for students without prior programming experience."
  }
]
```
**Error Handling:**
If the server encounters an error while filtering course data, it returns a 500 Server Error and plain text message:
`An error occurred on the server. Try again later.`

## User login with Cookies.
**Request Format:** /enroll/login

**Request Type:** POST

**Returned Data Format**: plain text

**Description:** Allow users to input email and password to login. Only matched email and password in the database make successfully login. User id is stored in Cookies.

**Example Request:** enroll/login

**Example Response:**

`abc@uw.edu`

**Error Handling:**
If user inputs with invalid email or password, it returns a 400 Client Error and palin text message:
`Wrong email or password. Please try again.`

If the server encounters an error while retrieving course data, it returns a 500 Server Error and plain text message:
`An error occurred on the server. Try again later.`

## Enroll in courses.
**Request Format:** /enroll/enrollcourse

**Request Type:** POST

**Returned Data Format**: plain text

**Description:** Allow users to enroll in a course and make modification of database. Only users logged in can enroll in the class. Only courses have available spots can be enrolled.

**Example Request:** enroll/enrollcourse

**Example Response:**

`success`

**Error Handling:**
If user is not logged in, it returns a 400 Client Error and palin text message:
`Please login at first.`

If the course doesn't have available spots, it returns a 400 Client Error and palin text message:
`There is no available spot.`

If the server encounters an error while retrieving course data, it returns a 500 Server Error and plain text message:
`An error occurred on the server. Try again later.`

## Add course to wishlist.
**Request Format:** /enroll/addwishlist

**Request Type:** POST

**Returned Data Format**: plain text

**Description:** Allow users to add a course to wishlist and make modification of database. Only users logged in can add course to wishlist.

**Example Request:** enroll/addwishlist

**Example Response:**

`success`

**Error Handling:**
If user is not logged in, it returns a 400 Client Error and palin text message:
`Please login at first.`

If the server encounters an error while retrieving course data, it returns a 500 Server Error and plain text message:
`An error occurred on the server. Try again later.`

## Get completed courses, enrolled courses, and wishlist.
**Request Format:** /enroll/viewenrollment

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Allow users to get their completed courses, enrolled courses, and wishlist. Login required.

**Example Request:** enroll/viewenrollment

**Example Response:**

```json
{
  "completed": {
    "name": "CSE 121",
    "title": "Introduction to Computer Programming I"
  },
  "enrolling": {
    "name": "CSE 143 ",
    "title": "Computer Programming II"
  },
  "wishlist": {
    "name": "INFO 441",
    "title": "Server-Side Development"
  }
}
```

**Error Handling:**
If user is not logged in, it returns a 400 Client Error and palin text message:
`Please login at first.`

If the server encounters an error while retrieving course data, it returns a 500 Server Error and plain text message:
`An error occurred on the server. Try again later.`

## Notification
**Request Format:** /enroll/notification

**Request Type:** GET

**Returned Data Format**: plain text

**Description:** Notify users when there is available spots of course in wishlist. Login required.

**Example Request:** enroll/notification

**Example Response: 1**

`Now there is spot available of CSE 143 : Computer Programming II`

**Example Response: 2**

`There is no available spot of your waiting course.`

**Example Response: 3**

`There is no course in your wishlist.`

**Error Handling:**
If user is not logged in, it returns a 400 Client Error and palin text message:
`Please login at first.`

If the server encounters an error while retrieving course data, it returns a 500 Server Error and plain text message:
`An error occurred on the server. Try again later.`
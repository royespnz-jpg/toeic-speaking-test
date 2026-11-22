// The teacher's Google Apps Script web app (google-apps-script/Code.gs), the
// URL that ends in /exec. A link with ?s=<url> (from the Teacher page) also
// sets it for the students who open it.
export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbycNu9tUzSIZvPljpOWIwr-f4DVYwgaOyL5EhwuOjs_nyzF3ueQnJIUABJsndj2OtleAg/exec';

// A browser that saved one of these (from the Teacher page or a ?s= link)
// uses SCRIPT_URL instead: earlier deployments of this exam's script.
export const RETIRED_URLS = [];

// The code that opens the teacher pages (set-up, the versions and the
// preview). It keeps students out of them during the exam; it is not a
// password: anyone who reads the page's code can find it.
export const TEACHER_CODE = '6060';

// The google-apps-script/Code.gs this page expects (its doGet says which one
// is deployed); with an older one the Teacher page asks for the update.
export const SCRIPT_VERSION = 2;

// What the teacher's script calls itself (its doGet says it): the Teacher page
// uses it to tell this exam's script from another exam's.
export const SCRIPT_APP = 'Speaking Test';

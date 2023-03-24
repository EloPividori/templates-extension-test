let authToken
let categories = []
const baseURL = 'http://localhost:3000/'

const displayLogin = () => {

  const html = `<div id="template-extension-popup" style="background: rgba(0,0,0,0.3); position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
    <div style="background: white; border-radius: 20px; padding: 30px; max-width: 500px; width: 100%;">
    <a href='http://localhost:3000//users/sign_in' target="blank">Sign in</a>
    </div>
  </div>`
  document.body.insertAdjacentHTML('beforeend', html)
}

const displayCategories = (categories) => {
  const buildCategory = (category) => {
    let categoriesHtml = `<div style="border: 1px solid black; padding: 5px; margin-bottom: 5px;">${category.title}`
    let templatesHtml = ''
    category.templates.forEach(template => {
      templatesHtml += `<div class="template" style="border: 1px solid black; padding: 5px; margin-bottom: 5px;">${template["title"]}</div>`
    })
    return (categoriesHtml + templatesHtml + '</div>')
  }

  const buildCategories = (cats) => {
    let catsHTML = ''
    cats.forEach(cat => {
      catsHTML += buildCategory(cat)
    });
    return catsHTML
  }


  const html = `<div id="template-extension-popup" style="z-index:9999;background: rgba(0,0,0,0.3); position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
  <div style="background: white; border-radius: 20px; padding: 30px; max-width: 500px; max-height: 50%; width: 100%;overflow-y:scroll;">
  <h2>My Categories</h2>
  ${buildCategories(categories)}
      <button id="populate-template">fill template</button>
      <div id="template-content"></div>
    </div>
  </div>`
  document.body.insertAdjacentHTML('beforeend', html)
  document.querySelectorAll(".template").forEach((templateCard) => {
    templateCard.addEventListener('click', (event) => {

      // add to clipboard
      navigator.clipboard.writeText(event.currentTarget.textContent)
      document.querySelector('#template-extension-popup').remove()
    })
  })

  const popButton = document.querySelector('#populate-template')
  popButton.addEventListener('click', (event) => {
    const templateContent = document.querySelector('#template-extension-popup #template-content')
    templateContent.innerHTML = 'Random test for content'
  })

}

const getCategories = () => {
  fetch(`${baseURL}api/v1/categories`, {
    Headers: {'X-User-Token': authToken}
  })
    .then((res) => res.json())
    .then((data) => {
      console.log('authToken: ', authToken)
      console.log(data)
      categories = data
      // document.insertAdjacentHTML('beforeend', `
      //     <div style="position: fixed; top: 0; left: 0; z-index: 1000; background: white; padding: 20px;">
      //       ${data}
      //       </div>
      //       `)
    })
}

chrome.cookies.get(
  {url: baseURL, name: 'auth_token'},
  (cookie) => {
    console.log(cookie)
    authToken = cookie.value
    if (authToken === '') {
      // if this cookie doesnt exist show them link to sign in
      console.log("NO COOKIE, DIRECT USER TO LOGIN :)")
    } else {
      // if it does exist, then fetch the categories and display on the page
      getCategories()
    }
  }
)

chrome.action.onClicked.addListener((tab) => {
  if (!tab.url.includes('chrome://')) {
    chrome.cookies.get({url: baseURL, name: 'auth_token'}, (cookie) => {
      if (cookie.value !== '') {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: displayCategories,
          args: [ categories ],
        });
      } else {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: displayLogin,
        })
      }
  })
  }
});

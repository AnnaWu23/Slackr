/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * 
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export function fileToDataUrl(file) {
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        throw Error('provided file is not a png, jpg or jpeg image.');
    }
    
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}


// POST call
export const apiCallPOST = (path, token, body) => {
  return new Promise((resolve, reject) => {
      fetch('http://localhost:5005/' + path, {
      method: 'POST',
      headers: {
          'Content-type': 'application/json',
          'Authorization': ((token) ? (`Bearer ${token}`) : "")
        },
      body: JSON.stringify(body)
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data);
        }
      })
      .catch((error) => {
        reject(error);
      });
    });
};

// GET call
export const apiCallGET = (path, token=null, queryString=null) => {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:5005/' + path + (queryString ? ('?' + queryString) : ""), {
      method: 'GET',
      headers: {
          'Content-type': 'application/json',
          'Authorization': ((token) ? (`Bearer ${token}`) : "")
        },
    })
    .then((response) => response.json())
    .then((body) => {
      if(body.error){
        reject(body.error);
      }
      resolve(body);
    })
    .catch((error) => {
      reject(error);
    });
  });
};

// PUT call
export const apiCallPUT = (path, token, body) => {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:5005/' + path, {
    method: 'PUT',
    headers: {
        'Content-type': 'application/json',
        'Authorization': ((token) ? (`Bearer ${token}`) : "")
      },
    body: JSON.stringify(body)
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        reject(data.error);
      } else {
        resolve(data);
      }
    })
    .catch((error) => {
      reject(error);
    });
  });
};


// DELETE call
export const apiCallDELETE = (path, token) => {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:5005/' + path, {
    method: 'DELETE',
    headers: {
        'Content-type': 'application/json',
        'Authorization': ((token) ? (`Bearer ${token}`) : "")
      },
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        reject(data.error);
      } else {
        resolve(data);
      }
    })
    .catch((error) => {
      reject(error);
    });
  });
};

export const raiseError = (error) => {
  const errorPop = new bootstrap.Modal(document.getElementById('error-pop'), {});
  let errorMsg = document.getElementById('error-msg');
  errorMsg.textContent = error;
  errorPop.show();
}

export const closeModal = (modalId) => {
  const modal = bootstrap.Modal.getInstance(document.getElementById(modalId))
  modal.hide();
}

export const toggleDisplay = (elementId) => {
  let element = document.getElementById(elementId);
  element.style.display = 'block';
}

export const toggleHidden = (elementId) => {
  let element = document.getElementById(elementId);
    element.style.display = 'none';
}

export const isValid = (param) => {
  return (param !== null && param !== undefined && param !== "");
}

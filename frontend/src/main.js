import { BACKEND_PORT } from './config.js';

import { apiCallPOST, apiCallGET, fileToDataUrl, apiCallPUT, raiseError, closeModal, apiCallDELETE, toggleDisplay, toggleHidden, isValid} from './helpers.js';

// Global variables
let globalToken = localStorage.getItem('token');
// messageIsLoading is used to prevent multiple loading of messages
let messageIsLoading = true;
// resizing is used to prevent multiple resizing of the channel page
let resizing = false;
// channelImages is used to store all the image urls in the channel
let channelImages = [];


const modalElement = document.getElementById('edit-profile-pop');
let fileInput = document.getElementById("upload-file-input");
let messageInput = document.getElementById("message-input");
let uploadButton = document.getElementById("upload-file");

// Hide all the pages
const hideAllPages = () => {
    for(const page of document.querySelectorAll(".page-block")) {
        page.style.display = "none";
    };
}

// Show the page
const showPage = (page) => {
    hideAllPages();
    // show/hide the banner
    if(page !== "login" && page !== "register") {
        document.getElementById("banner").style.display = "none";
    } else {
        document.getElementById("banner").style.display = "block";
    }
    // show/hide the footer
    if(page === "channel" || page === "dashboard") {
        document.getElementsByTagName("footer")[0].style.display = "none";
    } else {
        document.getElementsByTagName("footer")[0].style.display = "block";
    }
    // show the page
    document.getElementById(`page-${page}`).style.display = "block";
    // render the page
    // it will call the render function for each page
    // The render function will be named as renderPageName, replace the PageName with the actual page name
    eval(`render${page.charAt(0).toUpperCase() + page.slice(1)}()`);
}

// ALL THE PAGE RENDERING FUNCTIONS -------------------- 
// render the login page: nothing need to be changed
const renderLogin = () => {
    console.log("rendering login");
}

// render the register page: nothing need to be changed
const renderRegister = () => {
    console.log("rendering register");
}

// render the dashboard page:
// -- get the channel list
// -- render the channel list
const renderDashboard = () => {
    console.log("rendering dashboard");
    apiCallGET("channel", globalToken, null)
    .then((body) => {
        let dashboardChannelList = document.getElementById("channels-list-dashboard");
        channelList(body, dashboardChannelList);
    })
    .catch((msg) => {
        raiseError(msg);
    });
}

// render the channel page:
// -- get the channel info
// -- render the channel info
// -- get the message list
// -- render the message list
const renderChannel = () => {
    document.getElementById(`page-channel`).style.display = "flex";
    const channelId = localStorage.getItem('channelId');
    localStorage.removeItem('channelId');
    // Get channel list
    document.getElementById("page-channel").setAttribute("channel-id", channelId);
    const channelName = document.getElementById("channel-name");
    const channelDescription = document.getElementById("channel-description");
    const channelCreation = document.getElementById("channel-creation");
    const channelPrivateOrPublic =  document.getElementById("channel-pub-or-pri")
    const channelCreator = document.getElementById("channel-creator");
    
    // get channel info
    apiCallGET(`channel/${channelId}`, globalToken, null)
    .then((body) => {
        channelName.textContent = body.name;
        channelDescription.textContent = body.description;
        channelCreation.textContent = new Date(body.createdAt).toDateString();
        channelPrivateOrPublic.textContent = body.private ? "private" : "public";
        return body.creator;
    })
    .then((userId) => {
        getUserInfo(userId)
        .then((userInfo) => {
            console.log("running");
            channelCreator.textContent = userInfo.name;
        })
    })
    .then(() => {
        // Clear the chat box
        let chatBox = document.getElementById('chat-box');
        while(chatBox.hasChildNodes()) {
            chatBox.removeChild(chatBox.firstChild);
        }
    })
    .then(() => {
        // Get message list
        showLoading();
        showMessages(channelId, 0)
        .then(() => {
            console.log("loading message");
        })
    })
    .then(() => {
        // Rendering all the pinned msgs
        renderPinnedMessages(0, true);
    })
    .then(() => {
        resizeChannelPage();
    })
    .catch((msg) => {
        raiseError(msg);
        showPage('dashboard');
    })
    
}

// get the user info
const getUserInfo = (userId) => {
    return new Promise((resolve, reject) => {
        apiCallGET(`user/${userId}`, globalToken, null)
        .then((body) => {
            resolve(body);
        })
        .catch((msg) => {
            reject(msg);
        });
    });
}

// this function is used to get the channel messages with given channel id and start index
const getMessages = (channelId, start) => {
    return new Promise((resolve, reject) => {
        apiCallGET(`message/${channelId}`, globalToken, `start=${parseInt(start)}`)
        .then((body) => {
            resolve(body.messages);
        })
        .catch((msg) => {
            reject(msg);
        });
    });
}

// This will render the channels list with given channels' array and the target box
const channelList = (channels, channelBoard) => {
    // Clear the channel cache
    localStorage.removeItem('channelId');
    localStorage.removeItem('start');
    channelImages=[];

    // Get user id stored in localStorage
    const userId = parseInt(localStorage.getItem('userId'));
    while(channelBoard.hasChildNodes()) {
        channelBoard.removeChild(channelBoard.firstChild);
    }
    channels.channels.forEach((singleChannel) => {
        // If user is not the creator, the channel is private and user is not the member, skip this channel
        if (singleChannel.private && singleChannel.creator !== userId && !(singleChannel.members).includes(userId)) {
            return;
        }
        // Create the channel element
        let channel = document.createElement("a");
        channel.setAttribute("href", "#");
        channel.classList.add("list-group-item", "list-group-item-action", "py-3", "lh-tight");
        // Create the channel name and join element container
        let channelNameAndPrivate = document.createElement("div");
        channelNameAndPrivate.classList.add("d-flex", "w-100", "align-items-center", "justify-content-between");
        channel.appendChild(channelNameAndPrivate);
        // Create the channel name element
        let channelName = document.createElement("strong");
        channelName.classList.add("mb-1");
        channelName.textContent = singleChannel.name;
        channelNameAndPrivate.appendChild(channelName);
        // Create the channel private element
        let channelPrivate = document.createElement("small");
        channelPrivate.textContent = singleChannel.private ? "private" : "public";
        channelNameAndPrivate.appendChild(channelPrivate);
        // Check if the user is a member of this channel
        // If the user is a member, create the join button
        if (!(singleChannel.members).includes(userId)) {
            // Create the join button
            // <button type="button" class="btn btn-light">Light</button>
            let channelJoin = document.createElement("button");
            channelJoin.classList.add("btn", "btn-light");
            channelJoin.textContent = "Join";
            channelNameAndPrivate.appendChild(channelJoin);
            addEventListenersChannelJoinBtn(channelJoin, singleChannel);
        } else if ((singleChannel.members).includes(userId) && singleChannel.creator !== userId) {
            // Create the join button
            // <button type="button" class="btn btn-light">Light</button>
            let channelExit = document.createElement("button");
            channelExit.classList.add("btn", "btn-light");
            channelExit.textContent = "Exit";
            channelNameAndPrivate.appendChild(channelExit);
            addEventListenersChannelExitBtn(channelExit, singleChannel);
        }

        // Construct the channel element
        channel.appendChild(channelPrivate);
        channelBoard.appendChild(channel);
        channel.setAttribute("channel-id", singleChannel.id);
        // Enter the channel by clicking on the channel element
        channel.addEventListener("click", (e) => {
            localStorage.setItem('channelId', singleChannel.id); 
            closeSideBar();
            showPage("channel");
        });
        // hover effect
        channel.addEventListener("mouseover", () => {
            channel.classList.add("active");
        });
        channel.addEventListener("mouseout", () => {
            channel.classList.remove("active");
        });

        
    });
}

// This only use for the chatbox
const showMessages = (channelId, start, length = 25, bottom = true, scrollToBottom = true) => {
    messageIsLoading = true;
    let chatBox = document.getElementById('chat-box');
    return getMessages(channelId, start)
        .then(messages => {
            return renderMessages(messages.slice(0, length), bottom, chatBox, true, scrollToBottom)
                   .then(() => messages);
        })
        .then(messages => {
            start += messages.length;
            localStorage.setItem('start', start);
            if (bottom) {
                messages.reverse().forEach((message) => {
                    // Get the image url if there is any
                    if (isValid(message.image)) {
                        channelImages.push(message.image);
                    }
                });
            } else {
                messages.forEach((message) => {
                    // Get the image url if there is any
                    if (isValid(message.image)) {
                        channelImages.unshift(message.image);
                    }
                }
            )};
            
        })
        .catch(error => {
            console.log(error);
            raiseError(error);
        })
        .finally(() => {
            messageIsLoading = false;
        });
}


// render messages used for both chatbox and pinnedbox
const renderMessages = (messages, bottom, chatBox, showButton, scrollToBottom) => {
    return renderMessagesRecursively(messages.reverse(), 0, bottom, chatBox, showButton, scrollToBottom)
    .catch((msg) => {
        raiseError(msg);
    });
}


const renderMessagesRecursively = (messages, index, bottom, chatBox, showButton, scrollToBottom) => {
    return new Promise((resolve, reject) => {
        if (index < messages.length) {
            messagePromise(messages[index], bottom, chatBox, showButton)
                .then(() => {
                    return renderMessagesRecursively(messages, index + 1, bottom, chatBox, showButton, scrollToBottom);
                })
                .then(() => {
                    if (index === messages.length - 1 && scrollToBottom) { // Check if it's the last message
                        chatboxScrollToBottom();
                    }
                    resolve();
                })
                .catch(error => {
                    console.log(error);
                    reject(error);
                });
        } else {
            messageIsLoading = false;
            resolve();
        }
    });
}

const messagePromise = (message, bottom, chatBox, showButton=true) => {
    return new Promise((resolve, reject) => {
        getUserInfo(message.sender)
        .then((userInfo) => {
            // channelId
            const channelId = parseInt(document.getElementById("page-channel").getAttribute("channel-id"));

            // Create the message element
            const messageDiv = document.createElement('div');
            messageDiv.id = `message-${message.id}`;
            messageDiv.className = 'd-flex mb-3';

            // Create the image element
            const img = document.createElement('img');
            img.src = isValid(userInfo.image) ? userInfo.image : '';
            img.className = 'rounded-circle m-1';
            img.width = 20;
            img.height = 20;
            messageDiv.appendChild(img); 

            // Emoji substitution
            const emoji = document.createElement("span")
            emoji.textContent = '😶‍🌫️';
            emoji.width = 20;
            emoji.height = 20;
            emoji.className = 'emoji';
            emoji.classList.add('rounded-circle', 'mx-1');
            messageDiv.appendChild(emoji);
            if (!isValid(userInfo.image)) {
                img.style.display = 'none';
                emoji.style.display = 'block';
            } else {
                emoji.style.display = 'none';
                img.style.display = 'block';
            }

            // Create the text element
            const textDiv = document.createElement('div');
            messageDiv.appendChild(textDiv);

            // Name setting
            const strong = document.createElement('a');
            strong.setAttribute("data-bs-toggle", "modal");
            strong.setAttribute("data-bs-target", "#edit-profile-pop");
            strong.setAttribute("href", "#");
            strong.setAttribute("user-id", message.sender);
            strong.classList.add('fw-bold', 'text-decoration-none', 'custom-link-color');
            strong.textContent = userInfo.name;
            textDiv.appendChild(strong);
            textDiv.appendChild(document.createElement('br'));

            // Date sent
            const small = document.createElement('small');
            small.className = 'text-muted';
            var date = new Date(message.sentAt);
            var options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            small.textContent = new Intl.DateTimeFormat('en-US', options).format(date);
            textDiv.appendChild(small);

            // Message content
            const div = document.createElement('div');
            div.textContent = message.message;
            textDiv.appendChild(div);

            if (bottom) {
                chatBox.appendChild(messageDiv);
            } else {
                chatBox.insertBefore(messageDiv, chatBox.firstChild);
            }

            // Create the image element (small image)
            const image = document.createElement('img');
            image.src = isValid(message.image) ? message.image : '';
            image.className = 'rounded m-1';
            image.width = 70;
            image.setAttribute("data-bs-toggle", "modal");
            image.setAttribute("data-bs-target", "#image-display-pop");
            textDiv.appendChild(image);

            if(!isValid(message.image)) {
                image.style.display = 'none';
            } else {
                image.style.display = 'block';
            }

            if(!showButton) {
                resolve();
                return;
            }

            // Edited indicator
            const edited = document.createElement('small');
            edited.className = 'text-muted';
            edited.textContent = `edited on ${new Intl.DateTimeFormat('en-US', options).format(new Date(message.editedAt))}`;
            textDiv.appendChild(edited);
            if (!message.edited) {
                edited.style.display = 'none';
            } else {
                edited.style.display = 'block';
            }

            // Message Edit Input
            const editInput = document.createElement('input');
            editInput.className = 'form-control form-control-sm';
            editInput.style.display = 'none';
            textDiv.appendChild(editInput);
            

            // Edit button
            if (message.sender === parseInt(localStorage.getItem('userId'))) {
                const editButton = document.createElement('button');
                editButton.className = 'btn btn-sm btn-outline-secondary';
                editButton.textContent = 'Edit';
                textDiv.appendChild(editButton);
                // add logic to edit message
                editButton.addEventListener('click', () => {
                    if(editButton.textContent === 'Edit') {
                        // hide the message for now
                        div.style.display = 'none';
                        // show the edit input
                        editInput.style.display = 'block';
                        editInput.value = div.textContent;
                        // change the button text
                        editButton.textContent = 'Save';
                    } else {
                        if (editInput.value === div.textContent) {
                            raiseError("Message cannot be same");
                            return;
                        }
                        // update the message
                        apiCallPUT(`message/${channelId}/${message.id}`, globalToken, {
                            channelId, messageId: message.id, message: editInput.value, image: ""
                        })
                        // show the message
                        div.style.display = 'block';
                        div.textContent = editInput.value;
                        // hide the edit input
                        editInput.style.display = 'none';
                        // change the button text
                        editButton.textContent = 'Edit';
                        // update the edited indicator
                        edited.textContent = `edited on ${new Intl.DateTimeFormat('en-US', options).format(new Date())}`;
                        edited.style.display = 'block';
            
                    }
                })
            }
            
            // Delete button
            if (message.sender === parseInt(localStorage.getItem('userId'))) {
                const deleteButton = document.createElement('button');
                deleteButton.className = 'btn btn-sm btn-outline-secondary  m-1';
                deleteButton.textContent = 'Delete';
                textDiv.appendChild(deleteButton);
                // add logic to delete message
                deleteButton.addEventListener('click', () => {
                    apiCallDELETE(`message/${channelId}/${message.id}`, globalToken, {
                        channelId, messageId: message.id
                    })
                    .then(() => {
                        document.getElementById(`message-${message.id}`).remove();

                    })
                    .catch((msg) => {
                        raiseError(msg);
                    });
                        
                })
            }

            // Pin button
            const pinButton = document.createElement('button');
            pinButton.className = 'btn btn-sm btn-outline-secondary  m-1';
            pinButton.textContent = message.pinned ? 'Unpin' : 'Pin';
            textDiv.appendChild(pinButton);

            // add logic to pin message
            pinButton.addEventListener('click', () => {
                if(pinButton.textContent === 'Pin') {
                    apiCallPOST(`message/pin/${channelId}/${message.id}`, globalToken, {
                        channelId, messageId: message.id
                    })
                    .then(() => {
                        renderPinnedMessages(0, true);
                    })
                    .then(() => {
                        // update the button text
                        pinButton.textContent = 'Unpin';
                    })
                    .catch((msg) => {
                        raiseError(msg);
                    });
                } else {
                    apiCallPOST(`message/unpin/${channelId}/${message.id}`, globalToken, {
                        channelId, messageId: message.id
                    })
                    .then(() => {
                        renderPinnedMessages(0, true);
                    })
                    .then(() => {
                        // update the button text
                        pinButton.textContent = 'Pin';
                    })
                    .catch((msg) => {
                        raiseError(msg);
                    });
                }
            })
            
            // Create reaction buttons
            let reactions = ["👍", "😂", "👏"]
            for (let index = 0; index < reactions.length; index++) {
                const reactionButton = document.createElement('button');
                reactionButton.className = 'btn btn-sm btn-outline-secondary m-1';
                let reactionCount = (message.reacts.filter(element => parseInt(element.react) === index)).length;
                reactionButton.textContent = `${reactions[index]}  ${reactionCount}`;
                textDiv.appendChild(reactionButton);
                // set the button border color in terms of the message reacts
                if (message.reacts.filter(element => parseInt(element.react) === index && parseInt(element.user) === parseInt(localStorage.getItem('userId'))).length > 0) {
                    reactionButton.style.borderColor = "blue";
                } else {
                    reactionButton.style.borderColor = "gray";
                }

                // add logic to react message
                reactionButton.addEventListener('click', () => {
                    if (reactionButton.style.borderColor !== "blue") {
                        apiCallPOST(`message/react/${channelId}/${message.id}`, globalToken, {
                            channelId, messageId: message.id, react: `${index}`
                        })
                        .then(() => {
                            // update the reaction count
                            reactionCount += 1;
                            reactionButton.textContent = `${reactions[index]}  ${reactionCount}`;
                            // set the button border to blue
                            reactionButton.style.borderColor = "blue";
                        })
                        .catch((msg) => {
                            raiseError(msg);
                        });
                    } else {
                        apiCallPOST(`message/unreact/${channelId}/${message.id}`, globalToken, {
                            channelId, messageId: message.id, react: `${index}`
                        })
                        .then(() => {
                            // update the reaction count
                            reactionCount -= 1;
                            reactionButton.textContent = `${reactions[index]}  ${reactionCount}`;
                            // set the button border to gray
                            reactionButton.style.borderColor = "gray"; 
                        })
                        .catch((msg) => {
                            raiseError(msg);
                        });
                    }
                })
            }

            
            resolve();
        })
        .catch((msg) => {
            reject(msg);
        }); 
    });
}

const chatboxScrollToBottom = () => {
    let chatBox = document.getElementById('chat-box');
    chatBox.scrollTop = chatBox.scrollHeight;
}

// render all the pinned messages
const renderPinnedMessages = (start, bottom) => {
    let pinnedBox = document.getElementById('pinned-box');
    // clean the pinned box
    while(pinnedBox.hasChildNodes()) {
        pinnedBox.removeChild(pinnedBox.firstChild);
    }
    const channelId = parseInt(document.getElementById("page-channel").getAttribute("channel-id"));
    renderPinnedMessagesRecursively(channelId, start, []);
}

// Close the sidebar if have
const closeSideBar = () => {
    let offCanvasInstance = bootstrap.Offcanvas.getInstance(document.getElementById("offcanvas-channel-list"));
    if (offCanvasInstance) {
        offCanvasInstance.hide();
    }
}

// recursively fetch all the pinned messages
// Then render them with renderMessagesRecursively
const renderPinnedMessagesRecursively = (channelId, start, allPinnedMessages) => {
    getMessages(channelId, start, true)
    .then((messages) => {
        if (messages.length === 0) {
            // all pinned messages are fetched
            renderMessages(allPinnedMessages.reverse(), false, document.getElementById('pinned-box'), false, false);
            return;
        }

        // add the new messages to the allPinnedMessages array
        messages.forEach((message) => {
            if (message.pinned) {
                allPinnedMessages.push(message);
            }
        });
        // recursively fetch the next page of pinned messages
        renderPinnedMessagesRecursively(channelId, start + messages.length, allPinnedMessages);  
    })
    .catch((error) => {
        console.error('Error loading pinned messages:', error);
    });
}


const addEventListenersChannelJoinBtn = (channelJoin, singleChannel) => {
    channelJoin.addEventListener("click", (e) => {
        e.stopPropagation();
        apiCallPOST(`channel/${singleChannel.id}/join`, globalToken, {
            "channelId": singleChannel.id
        })
        .then((body) => {
            console.log(body);
            localStorage.setItem('channelId', singleChannel.id);
            showPage("channel");
        })
        .catch((msg) => {
            raiseError(msg);
        });
    });
}

const addEventListenersChannelExitBtn = (channelExit, singleChannel) => {
    channelExit.addEventListener("click", (e) => {
        e.stopPropagation();
        apiCallPOST(`channel/${singleChannel.id}/leave`, globalToken, {
            "channelId": singleChannel.id
        })
        .then((body) => {
            console.log(body);
            renderDashboard();
        })
        .catch((msg) => {
            raiseError(msg);
        });
    });
}



// Add event listener for the register submit button
document.getElementById("register-submit").addEventListener("click", (e) => {
    const email = document.getElementById("register-email").value;
    const name = document.getElementById("register-name").value;
    const password = document.getElementById("register-password").value;
    const passwordConfirm = document.getElementById("register-password-confirm").value;
    if (password !== passwordConfirm) {
        raiseError("Passwords do not match");
        return;
    } else {
        apiCallPOST("auth/register", null, {
            email, name, password
        }).then((body) => {
            console.log("registering");
			const { token, userId } = body;
			globalToken = token;
			localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
			showPage('dashboard');
		})
		.catch((msg) => {
            console.log(msg);
			raiseError(msg);
		});
    }
});

// Add event listener for the login submit button
document.getElementById("login-submit").addEventListener("click", (e) => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    apiCallPOST("auth/login", null, {
        email, password
    }).then((body) => {
        const { token, userId } = body;
        globalToken = token;
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        showPage('dashboard');
    })
    .catch((msg) => {
        raiseError(msg);
    });
});

// Add event listener for the add new channel button
document.getElementById("add-channel-submit").addEventListener("click", (e) => {
    const channelName = document.getElementById("add-channel-name").value;
    const channelDescription = document.getElementById("add-channel-description").value;
    const channelPrivate = document.getElementById("add-channel-private").checked;
    console.log(channelPrivate);
    if (!isValid(channelName)) {
        raiseError("Channel name cannot be empty");
        return;
    }
    apiCallPOST("channel", globalToken, {
        name: channelName,
        private: channelPrivate,
        description: channelDescription
    }).then((body) => {
        console.log(body);
        const createChannelForm = document.getElementById("add-channel-pop-form");
        createChannelForm.reset();
        closeModal('add-channel-pop');
    })
    .then(() => {
        renderDashboard();
    })
    .catch((msg) => {
        raiseError(msg);
    });
});



// Add event listener for the add new channel button
document.getElementById("edit-channel-submit").addEventListener("click", (e) => {
    const channelName = document.getElementById("edit-channel-name").value;
    const channelDescription = document.getElementById("edit-channel-description").value;
    const channelId = document.getElementById("page-channel").getAttribute("channel-id");
    if (!isValid(channelName)) {
        raiseError("Channel name cannot be empty");
        return;
    }
    apiCallPUT(`channel/${channelId}`, globalToken, {
        name: channelName,
        description: channelDescription,
        channelId: channelId
    })
    .then((body) => {
        console.log(body);
        const editChannelForm = document.getElementById("edit-channel-pop-form");
        editChannelForm.reset();
        closeModal('edit-channel-pop');
    })
    .then(() => {
        localStorage.setItem('channelId', parseInt(channelId));
        renderChannel();
    })
    .catch((msg) => {
        raiseError(msg);
    });
});

// Add close modal event listener for all the modals
document.querySelectorAll(".modal-close").forEach((modalCloseBtn) => {
    modalCloseBtn.addEventListener("click", (e) => {
        // get the modal name
        const modalName = modalCloseBtn.getAttribute("modal-name");
        // get the modal instance
        const modal = bootstrap.Modal.getInstance(document.getElementById(modalName));
        // hide the modal
        modal.hide();
        // reset the form if there is any
        const form = document.getElementById(`${modalName}-form`);
        if (form) {
            form.reset();
        }
    });
});


// Add event listener for all the redirect buttons
for(const redirect of document.querySelectorAll(".redirect")) {
    redirect.addEventListener("click", () => {
        console.log(redirect.getAttribute("redirect"));
        showPage(redirect.getAttribute("redirect"));
    });
};


// Triggered when the user scrolls the chat box
document.getElementById("chat-box").addEventListener('scroll', function () {
    if(messageIsLoading) {
        return;
    }
    let chatBox = document.getElementById('chat-box');
    if (chatBox.scrollTop === 0) {
        messageIsLoading = true;
        let start = parseInt(localStorage.getItem('start'));
        let channelId = document.getElementById("page-channel").getAttribute("channel-id");
        showLoading();
        showMessages(channelId, start, 25, false, false)
        .then(() => {
            messageIsLoading = false;
        })
        .catch((msg) => {
            console.log(msg);
            raiseError(msg);
        });
    }
});

const showLoading = () => {
    let loading = document.getElementById("loading");
    let toastLoading = new bootstrap.Toast(loading, {
        delay: 400 // 1 second
    });
    toastLoading.show();
};

document.getElementById("send-button").addEventListener('click', function () {
    let messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    const fileInput = document.getElementById("upload-file-input");
    const channelId = document.getElementById("page-channel").getAttribute("channel-id");

    // Both message and file are empty
    if (message === '' && !fileInput.files.length) {
        raiseError("Message/Image cannot be empty");
        return;
    }

    let postPromise; // Promise to handle either sending message or file

    if (fileInput.files.length > 0) { // File is selected
        postPromise = fileToDataUrl(fileInput.files[0])
        .then(dataUrl => {
            return apiCallPOST(`message/${channelId}`, globalToken, {
                channelId, 
                image: dataUrl
            });
        });
    } else if (message.length > 0) { // Message is provided
        postPromise = apiCallPOST(`message/${channelId}`, globalToken, {
            channelId, 
            message
        });
    }

    postPromise.then(() => {
        // Get the message just sent
        return getMessages(channelId, 0);
    })
    .then((messages) => {
        // Render the message
        return renderMessages(messages.slice(0,1), true, document.getElementById('chat-box'), true, true)
            .then(() => messages[0]);
    })
    .then((message) => {
        let start = parseInt(localStorage.getItem('start')); 
        start += 1;
        localStorage.setItem('start', start);
        // Add the dataURL to the session storage if there is any
        if (fileInput.files.length > 0) {
            channelImages.push(message.image);
        }
        // Clear the input box and file
        messageInput.value = '';
        fileInput.value = '';
        // able the upload image button and the input box
        resetSendArea();
    })
    .catch((msg) => {
        raiseError(msg);
    });
});

const resetSendArea = () => {
    let messageInput = document.getElementById('message-input');
    const fileInput = document.getElementById("upload-file-input");
    const uploadButton = document.getElementById('upload-file');
    // Clear the input box and file
    messageInput.value = '';
    fileInput.value = '';
    uploadButton.textContent = '+';
    // able the upload image button and the input box
    messageInput.disabled = false;
    fileInput.disabled = false;
    uploadButton.disabled = false;
    console.log('Reset Send Area Executed'); // Add this log
    console.log('UploadButton disabled status:', uploadButton.disabled); // Add this log
}


function resizeChannelPage(){
    if (resizing) return;

    resizing = true;
    let chatModule = document.getElementById('chat-module');
    let pinnedModule = document.getElementById('pinned-module');
    let parentElement = chatModule.parentNode;
    
    if (window.innerWidth < 768) {
        // If chatModule is before pinnedModule, then swap their positions
        if (chatModule.compareDocumentPosition(pinnedModule)) {
            parentElement.insertBefore(pinnedModule, chatModule);
        }
        // setup the page-channel display from flex-row to flex-column
        let pageChannel = document.getElementById("page-channel");
        pageChannel.style.flexDirection = "column";

    } else {
        // If pinnedModule is before chatModule, then swap their positions
        if (chatModule.compareDocumentPosition(pinnedModule)) {
            parentElement.insertBefore(chatModule, pinnedModule);
        }
        // setup the page-channel display from flex-column to flex-row
        let pageChannel = document.getElementById("page-channel");
        pageChannel.style.flexDirection = "row";
    }
    setSizeChannelStyle();
}

// Add resize event listener to call the function when the viewport size changes
window.addEventListener('resize', resizeChannelPage);

function setSizeChannelStyle() {
    const pinnedHeader = document.getElementById("pinned-header");
    const channelDetails = document.getElementById("channel-details");
    const channelName = document.getElementById('channel-name');
    const channelDescription = document.getElementById('channel-description');
    const details = document.querySelectorAll('#channel-details dt, #channel-details dd');
    const chatModule = document.getElementById('chat-module');
    const pinnedModule = document.getElementById('pinned-module');
    const channelInfo = document.getElementById('channel-info');
    if (window.innerWidth < 768) {
        channelName.classList.replace('display-4', 'h5');
        channelDescription.classList.replace('display-6', 'h6');  
        channelDescription.classList.remove('pb-4')
        details.forEach(detail => {
            // replace dd to span and add padding
            let span = document.createElement('span');
            span.textContent = detail.textContent;
            if (detail.id) span.id = detail.id;
            detail.replaceWith(span);
        });

        channelDetails.classList.replace('flex-column', 'flex-row');
        channelDetails.classList.add('justify-content-between');

        // replace the pinned header's tag from h3 to h6
        const h6Element = document.createElement('h6');
        h6Element.id = 'pinned-header'; 
        h6Element.textContent = pinnedHeader.textContent;
        pinnedHeader.replaceWith(h6Element);

        chatModule.classList.replace('p-3', 'p-1')
        pinnedModule.classList.replace('p-3', 'p-1')

        channelInfo.classList.replace('p-3', 'p-1')
    } else {
        if (!channelName.classList.contains('h5')) {
            resizing = false;
            return;
        }
        channelName.classList.replace('h5', 'display-4');
        channelDescription.classList.replace('h6', 'display-6');
        channelDescription.classList.add('pb-4')
        details.forEach(detail => {
            // replace span to dd and remove padding
            let dd = document.createElement('dd');
            dd.textContent = detail.textContent;
            // put the class back
            dd.classList.add('col-sm-9');
            detail.replaceWith(dd);
        });

        channelDetails.classList.replace('flex-row', 'flex-column');
        channelDetails.classList.remove('justify-content-between');

        // change the pinned header to h3
        const h3Element = document.createElement('h3');
        h3Element.id = 'pinned-header';
        h3Element.textContent = pinnedHeader.textContent;
        pinnedHeader.replaceWith(h3Element);

        chatModule.classList.replace('p-1', 'p-3')
        pinnedModule.classList.replace('p-1', 'p-3')

        channelInfo.classList.replace('p-1', 'p-3')
    }
    resizing = false;
}

// Logout btn event listener
document.getElementById("logout-button").addEventListener("click", (e) => {
    globalToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
});

// Add event listener for the back btn
document.getElementById("back-button").addEventListener("click", (e) => {
    localStorage.removeItem('channelId');
    localStorage.removeItem('start');
    channelImages=[];
});

document.getElementById("invite-people-btn").addEventListener("click", (e) => {
    // clean the user list
    let userListContainer = document.getElementById('user-list');
    while(userListContainer.hasChildNodes()) {
        userListContainer.removeChild(userListContainer.firstChild);
    }
    
    apiCallGET("user", globalToken, null)
    .then((body) => {
        // Map over the users and return an array of promises
        let promises = body.users.map(user => {
            return getUserInfo(user.id)
            .then(userInfo => {
                return {
                    id: user.id,
                    name: userInfo.name
                };
            });
        });

        // Wait for all promises to resolve
        return Promise.all(promises);
    })
    .then(users => {
        // Sort the users once all promises have resolved
        users.sort((a, b) => a.name.localeCompare(b.name));

        // For each user, create a checkbox and label, and add them to the user list
        users.forEach(user => {
            // Create a div container
            const userDiv = document.createElement('div');
            userDiv.className = 'form-check';

            // Create a checkbox
            const checkbox = document.createElement('input');
            checkbox.className = 'form-check-input';
            checkbox.type = 'checkbox';
            checkbox.value = user.id;
            checkbox.id = user.id;

            // Create a label
            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.setAttribute('for', user.id);
            label.textContent = user.name;

            // Add the checkbox and label to the div container
            userDiv.appendChild(checkbox);
            userDiv.appendChild(label);

            // Add the div container to the user list
            userListContainer.appendChild(userDiv);
        });
    })
    .catch((msg) => {
        console.log(msg);
        raiseError(msg);
    });
});


// Add event listener for the invite people submit button
document.getElementById("invite-people-submit").addEventListener("click", (e) => {
    const channelId = document.getElementById("page-channel").getAttribute("channel-id");
    const userListContainer = document.getElementById('user-list');
    const userCheckboxes = userListContainer.querySelectorAll('input[type="checkbox"]');
    let promises = [];
    userCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            promises.push(apiCallPOST(`channel/${channelId}/invite`, globalToken, {
                channelId, userId: parseInt(checkbox.value)
            }));
        }
    });
    Promise.all(promises)
    .then(() => {
        closeModal('invite-people-pop');
    })
    .catch((msg) => {
        closeModal('invite-people-pop');
        raiseError(msg);
    });
});

modalElement.addEventListener('show.bs.modal', (e) => {
    const triggerElement = e.relatedTarget;
    let userId = ""
    if (triggerElement.id !== "profile-button" && triggerElement.getAttribute("user-id") !== localStorage.getItem('userId')) {
        // hide the edit btn
        toggleHidden('edit-profile-btn');
        userId = parseInt(triggerElement.getAttribute("user-id"));
    } else {
        // if user is current user, then show edit profile pop up and save images button
        // show the edit btn
        toggleDisplay('edit-profile-btn');
        userId = parseInt(localStorage.getItem('userId'));
    }

    // Set user id to the modal
    modalElement.setAttribute("user-id", userId);

    getUserInfo(userId)
    .then((userInfo) => {
        // Set the user info
        // profile-picture
        if (!isValid(userInfo.image)) {
            toggleHidden('profile-picture');
            toggleDisplay('profile-picture-alt');
        } else{
            document.getElementById('profile-picture').src = userInfo.image;
            toggleHidden('profile-picture-alt');
            toggleDisplay('profile-picture');
        }

        // user-name
        document.getElementById('user-name').textContent = userInfo.name;
        // user-description
        document.getElementById('user-description').textContent = userInfo.bio;
        // user-email
        document.getElementById('user-email').textContent = userInfo.email;
    })

    

});


// Event listener for showing password
document.getElementById('show-password').addEventListener('change', function() {
    let passwordInput = document.getElementById('edit-password');
    if (this.checked) {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
});

// Event listener for Profile Edit button
document.getElementById('edit-profile-btn').addEventListener('click', function() {
    if(this.textContent === 'Edit') {
        // Toggle display for user info and edit form
        toggleDisplay("edit-profile-pop-form");
        toggleDisplay("upload-picture-section");
        toggleHidden("edit-profile-pop-user-info")
        // Fill the form with user info by default
        const userName = document.getElementById('user-name').textContent;
        document.getElementById('edit-name').value = userName;
        const userEmail = document.getElementById('user-email').textContent;
        document.getElementById('edit-email').value = userEmail;
        const userDescription = document.getElementById('user-description').textContent;
        document.getElementById('edit-description').value = userDescription;
        // user picture input is null
        document.getElementById('upload-picture-input').value = "";
        // Change the button text
        this.textContent = 'Save';
    } else {
        // Get values from the form
        const userName = document.getElementById('edit-name').value;
        const userEmail = document.getElementById('edit-email').value;
        const userDescription = document.getElementById('edit-description').value;
        const userPassword = document.getElementById('edit-password').value;
        let image = document.getElementById('upload-picture-input');
        
        // get user id
        const userId = parseInt(document.getElementById('edit-profile-pop').getAttribute('user-id'));
        if(userName !== "" && userEmail !== "" && userDescription !== "" && userPassword !== "") {
            let imagePromise;
            if (image && image.files[0]){
                image = image.files[0];
                imagePromise = fileToDataUrl(image).then(dataUrl => {
                    return dataUrl;
                });
            } else {
                imagePromise = Promise.resolve("");
            }
            // update the user info
            imagePromise.then(dataUrl => {
                let body = {
                    name: userName,
                    bio: userDescription,
                    password: userPassword,
                    image: dataUrl
                }
                apiCallPUT(`user`, globalToken, userEmail === document.getElementById('user-email').textContent ? body : {...body, email: userEmail})
                .then(() => {
                    // Update the info
                    getUserInfo(userId)
                    .then((userInfo) => {
                        // Set the user info
                        // profile-picture
                        if (!isValid(userInfo.image)) {
                            toggleHidden('profile-picture');
                            toggleDisplay('profile-picture-alt');
                        } else{
                            document.getElementById('profile-picture').src = userInfo.image;
                            toggleHidden('profile-picture-alt');
                            toggleDisplay('profile-picture');
                        }
                
                        // user-name
                        document.getElementById('user-name').textContent = userInfo.name;
                        // user-description
                        document.getElementById('user-description').textContent = userInfo.bio;
                        // user-email
                        document.getElementById('user-email').textContent = userInfo.email;

                        // set attribute to modal to show profile is edited
                        document.getElementById('edit-profile-pop').setAttribute('profile-edited', true);
                    })
                    .catch((msg) => {
                        console.log(msg);
                        raiseError(msg);
                        closeModal('edit-profile-pop');
                    });
                })
                .catch((msg) => {
                    raiseError(msg);
                    closeModal('edit-profile-pop');
                });
            })
            .catch((msg) => {
                closeModal('edit-profile-pop');
                raiseError(msg);
            });
        } else {
            closeModal('edit-profile-pop');
            raiseError("Field cannot be empty");
        }

        // reset the form
        document.getElementById('edit-profile-pop-form').reset();
        // checkbox reset
        document.getElementById('show-password').checked = false;
        // Ensure the checkbox for showing the password is unchecked and password is hidden
        const showPasswordCheckbox = document.getElementById('show-password');
        showPasswordCheckbox.checked = false;
        document.getElementById('edit-password').type = 'password';
        // Cleanup the image input
        document.getElementById('upload-picture-input').value = ""; 



        // Toggle hidden for user
        toggleHidden("edit-profile-pop-form");
        toggleHidden("upload-picture-section");
        toggleDisplay("edit-profile-pop-user-info")

        this.textContent = 'Edit';

    }
});

// Event listener for the user profile close button
document.getElementById("user-profile-close").addEventListener("click", (e) => {
    // Toggle hidden for user
    toggleHidden("edit-profile-pop-form");
    toggleHidden("upload-picture-section");
    toggleDisplay("edit-profile-pop-user-info")
    // Change the button text
    document.getElementById('edit-profile-btn').textContent = 'Edit';
    // reload the page only if profile is edited
    if (document.getElementById('edit-profile-pop').getAttribute('profile-edited')) {
        document.getElementById('edit-profile-pop').removeAttribute('profile-edited');
        localStorage.setItem('channelId', parseInt(document.getElementById("page-channel").getAttribute("channel-id")));
        localStorage.setItem('start', 0);
        showPage('channel');
    }
});


// Event listener for the upload picture button
uploadButton.addEventListener("click", (e) => {
    // If there's already a file selected, clear it
    if (fileInput.files.length > 0) {
        fileInput.value = "";
        // Enable the message input if the file selection is cleared
        messageInput.disabled = false; 
        uploadButton.textContent = "+";
        return;
    }
    fileInput.click(); // Open the file picker
});


// Event listener for the file input change
fileInput.addEventListener("change", (e) => {
    if (fileInput.files.length > 0) {
        // Disable the message input if a file is selected
        messageInput.disabled = true; 
        uploadButton.textContent = "-"; 
    } else {
        // Enable the message input if the file selection is cleared
        messageInput.disabled = false; 
        uploadButton.textContent = "+";
    }
});

// Event listener for the message input
messageInput.addEventListener("input", (e) => {
    if (messageInput.value.length > 0) {
        fileInput.disabled = true; // Disable the file input if there's text in the message input
        uploadButton.disabled = true; // Disable the upload button if there's text in the message input
    } else {
        fileInput.disabled = false; // Enable the file input if the message input is empty
        uploadButton.disabled = false; // Enable the upload button if the message input is empty
    }
});



// image showed in the modal
document.getElementById("image-display-pop").addEventListener("show.bs.modal", (e) => {
    const triggerElement = e.relatedTarget;
    document.getElementById("display-image").src = triggerElement.src;
    // find the index of the image in the local storage image
    let index = 0;
    channelImages.forEach((image, i) => {
        if (image === triggerElement.src) {
            index = i;
        }
    });
    // set the index to the modal
    document.getElementById("image-display-pop").setAttribute("index", index);
})

// Event listener for the previous image button
document.getElementById("prev-image").addEventListener('click', function() {
    let modal = document.getElementById("image-display-pop")
    let currentImageIndex = parseInt(modal.getAttribute("index"));
    currentImageIndex = (currentImageIndex - 1 + channelImages.length) % channelImages.length;
    document.getElementById("display-image").src = channelImages[currentImageIndex];
    modal.setAttribute("index", currentImageIndex);
    
});

// Event listener for the next image button
document.getElementById("next-image").addEventListener('click', function() {
    let modal = document.getElementById("image-display-pop")
    let currentImageIndex = parseInt(modal.getAttribute("index"));
    currentImageIndex = (currentImageIndex + 1) % channelImages.length;
    document.getElementById("display-image").src = channelImages[currentImageIndex];
    modal.setAttribute("index", currentImageIndex);
});



// Event listener for channel-sidebar
document.getElementById("channel-sidebar").addEventListener("click", (e) => {
    console.log("rendering channel list")
    apiCallGET("channel", globalToken, null)
    .then((body) => {
        let channelListChannel = document.getElementById("channels-list-channel");
        channelList(body, channelListChannel);
    })
    .catch((msg) => {
        raiseError(msg);
    });
});

// Event listener for add-channel-button-channel
document.getElementById("add-channel-btn-channel").addEventListener("click", (e) => {
    // close channel side bar
    closeSideBar();
});


// Set initial page
if (globalToken === null) {
    showPage('register');
} else {
    showPage('dashboard');
}



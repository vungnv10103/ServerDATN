document.addEventListener("DOMContentLoaded", function () {
    console.log("chat.js");

    let textMessage = document.querySelectorAll('.content-msg')
    textMessage.forEach(function (itemMsg) {
        let statusMsg = itemMsg.getAttribute("data-status");
        if (statusMsg == "unseen") {
            itemMsg.classList.add("fw-bold", "fst-italic")
        }
        else if (statusMsg == "seen") {

        }
    })


    let itemConversation = document.querySelectorAll('.conversation')
    itemConversation.forEach(function (item) {
        let idConversation = item.getAttribute("data-id");
        let idConversationSelected = item.getAttribute("data-id-selected");
        if (idConversation == idConversationSelected) {
            item.style.backgroundColor = 'aliceblue';
        }
        else {
            item.style.backgroundColor = '';
        }
        item.addEventListener('click', () => {
            let idMessage = item.getAttribute("data-id-msg");
            let idUserSelected = item.getAttribute("data-id-user");
            // alert(idMessage);
            console.log(idConversation, idMessage);
            getContentMsg(idConversation, idMessage, idUserSelected);

        })
    })

    async function getContentMsg(idConSelected, idMsg, idUserSelected) {
        let data = {
            idConSelected, idMsg, idUserSelected
        }
        let mData = btoa(JSON.stringify(data));
        utils.PushCookie("dataChat", mData);
        window.location.href = `/stech.manager/chat/c/`;
    }

});
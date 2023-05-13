import firebase from "firebase/app";
import { initializeApp } from "firebase/app";
import "firebase/storage";
import { upload } from "./upload";

const firebaseConfig = {
    apiKey: "xxx",
    authDomain: "xxx",
    projectId: "xxx",
    storageBucket: "xxx",
    messagingSenderId: "xxx",
    appId: "xxx"
};

const app = initializeApp(firebaseConfig);

const storage = firebase.storage();
console.log(storage);

upload('#file', {
    multi: true,
    accept: ['.png', '.jpeg', '.jpg', '.gif'],
    onUpload: function(files, blocks) {
        files.forEach((file, index) => {
            const ref = storage.ref(`images/${file.name}`);
            const task = ref.put(file);

            task.on('state_changed', snapshot => {
                const percentage = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0) + '%';
                const block = blocks[index].querySelector('.preview-info-progress');
                block.textContent = percentage;
                block.style.width = percentage;
            }, error => {
                console.log(error);
            }, () => {
                task.snapshot.ref.getDownloadURL().then(url => {
                    console.log('Download URL ', url);
                });
            });
        });
    }
});
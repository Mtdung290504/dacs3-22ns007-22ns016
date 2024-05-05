class EditDocumentContent {
    constructor({ categoryId, categoryName, docList }) {
        this.title = `Chỉnh sửa danh mục tài liệu: ${categoryName}`;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.docList = docList;
    }

    getModalBodyContent() {
        const container = document.createElement('div');
        const docList = document.createElement('div');
        const searchBox = document.createElement('input');
        const inputs = document.createElement('div');
        const [inputBox1, inputBox2, inputBox3] = [document.createElement('div'), document.createElement('div'), document.createElement('div')].map(ib => {
            ib.classList.add('input-box'); 
            return ib;
        });

        docList.innerHTML = '<h3>DANH SÁCH TÀI LIỆU</h3>';

        container.classList.add('wrapper', 'edit-doc');
        docList.classList.add('ctn', 'doc-list');
        inputs.classList.add('ctn', 'inputs');

        searchBox.type = 'text';
        searchBox.placeholder = 'Tìm tài liệu...';
        searchBox.addEventListener('input', event => {
            docList.querySelectorAll('a').forEach(a => {
                a.style.display = a.textContent
                .toLocaleLowerCase()
                .includes(event.target.value.toLocaleLowerCase()) ? 'inline-flex' : 'none';
            });
        });

        docList.appendChild(searchBox);

        this.docList.forEach(({ doc_id, file_name }) => {//<i class="fa fa-trash" aria-hidden="true"></i>
            createDocItemAndAddToList(doc_id, file_name);
        });

        function createDocItemAndAddToList(id, path) {
            const a = document.createElement('a');
            const icon = document.createElement('i');
            const [authorId, name] = path.split('/');
            const orName = name.substring(name.indexOf('-') + 1);

            a.href = `uploads/${authorId}/${name}`;
            a.target = 'blank';
            a.innerHTML = `<span>${orName}</span>`;
            icon.classList.add('fa', 'fa-trash');
            icon.setAttribute('aria-hidden', 'true');
            icon.addEventListener('click', event => {
                event.preventDefault();
                if(confirm(`Xác nhận xóa tài liệu: ${id}: ${orName}`)) {
                    RequestHandler.sendRequest('ajax/doc', {
                        docId: id,
                        fileName: name
                    }, 'DELETE').then(({ e, m, d })=>{
                        if(e) {
                            alert(e);
                            return;
                        }
                        if(m == 'ok') {
                            docList.removeChild(a);
                            const aInList = document.querySelector(`a[data-doc-id="${id}"].link-to-doc-in-list`);
                            aInList.parentElement.removeChild(aInList);
                        }
                    }).catch(error => console.log(error));
                }
            });

            a.appendChild(icon);
            docList.appendChild(a);
            return a;
        }

        inputBox1.innerHTML = `
        <label for="category-name">ĐỔI TÊN DANH MỤC</label>            
        <div style="display: flex; align-items: center;">
            <input type="text" name="category-name" id="category-name" placeholder="Tên mới...">
            <div class="btn">Xác nhận</div>
        </div>`;
        inputBox1.querySelector('.btn').addEventListener('click', ()=>{
            //Send request change name
            const input = inputBox1.querySelector('input[type="text"]');
            const newName = input.value;
            if(!newName) {
                alert('Tên không phù hợp');
                return;
            }
            RequestHandler.sendRequest('ajax/doc-category-name', { docCategoryId: this.categoryId, newName }, 'PUT')
            .then(({ e, m, d }) => {
                if(e) {
                    alert(e);
                    return;
                }
                if(m) {
                    alert(m);
                    document.querySelector('.modal-header').textContent = `Chỉnh sửa danh mục tài liệu: ${newName}`;
                    document.querySelector(`.document-category[data-doc-category-id="${this.categoryId}"] h4`).textContent = newName;
                    input.value = '';
                }
            })
            .catch(error => console.log(error));
        });
        
        inputBox2.innerHTML = `
        <label for="category-name">TẢI THÊM TÀI LIỆU</label>
            <div style="display: flex; align-items: center;">
            <input type="file" name="upload-file" id="upload-file" placeholder="Tải lên..." multiple>
            <div class="btn">Thêm</div>
        </div>`;
        inputBox2.querySelector('.btn').addEventListener('click', ()=>{
            //Send request upload file
            const inputFile = inputBox2.querySelector('input[type="file"]');
            const files = inputFile.files;

            if(files.length === 0) {
                alert('Vui lòng tải lên tệp!');
                return;
            }

            RequestHandler.sendRequest('ajax/add-docs-to-doc-category', {
                'doc-category-id': this.categoryId,
                'files': Array.from(files)
            }).then(({ e, m ,d }) => {
                if(e) alert(e);
                const containerOfDocCategory = document.querySelector(`details[data-conteiner-of-doc-category-id="${this.categoryId}"] .detail`);
                console.log(d);
                d.forEach(({ id, file_name }) => {
                    createDocItemAndAddToList(id, file_name);
                    const link = document.createElement('a');
                    link.classList.add('link-to-doc-in-list');
                    link.target = '_blank';
                    link.setAttribute('data-doc-id', id);
                    link.href = `uploads/${file_name}`;
                    link.textContent = file_name.split('/')[1].substring(file_name.split('/')[1].indexOf('-') + 1);
                    containerOfDocCategory.appendChild(link);
                });
                inputFile.value = '';
            }).catch(error => console.error(error));
        });

        const deleteBtn = document.createElement('div');
        deleteBtn.textContent = 'Xóa danh mục';
        deleteBtn.classList.add('btn', 'red');
        deleteBtn.addEventListener('click', () => {
            if(!confirm(`Xác nhận xóa danh mục ${this.categoryName}?`))
                return;

            //Send request to delete category
            RequestHandler.sendRequest('ajax/doc-category', {
                docCategoryId: this.categoryId
            }, 'DELETE').then(({ e, m, d })=> {
                if(e) {
                    alert(e);
                    return;
                }
                if(m == 'ok') {
                    document.body.classList.remove('open-modal');
                    const containerOfDocCategory = document.querySelector(`details[data-conteiner-of-doc-category-id="${this.categoryId}"]`);
                    containerOfDocCategory.parentElement.removeChild(containerOfDocCategory);
                }
            }).catch(error => console.log(error));
        });
        inputBox3.appendChild(deleteBtn);

        inputs.appendChild(inputBox1);
        inputs.appendChild(inputBox2);
        inputs.appendChild(inputBox3);

        container.appendChild(docList);
        container.appendChild(inputs);

        return container;
    }
}

class EditQuestLibContent {
    constructor({categoryId, categoryName, questList}) {
        this.title = `Chỉnh sửa thư viện trắc nghiệm: ${categoryName}`;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.questList = questList;
    }

    getModalBodyContent() {
        return document.createElement('div');
    }
}

class EditClassFileAttaches {
    constructor({ listOfDocCategoryAndDoc, listOfAttachedFileId, rootUrl }) {
        Object.assign(this, { listOfDocCategoryAndDoc, listOfAttachedFileId, rootUrl });
        this.className = document.querySelector('h2.class-name').textContent;
        this.title = `Quản lý tài liệu lớp ${this.className}`;
        this.classId = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
    }

    getModalBodyContent() {
        const wrapper = document.createElement('div');
        const ctn1 = document.createElement('div');
        const ctn2 = document.createElement('div');

        wrapper.classList.add('wrapper', 'edit-doc');
        [ctn1, ctn2].forEach(ctn => ctn.classList.add('ctn'));
        ctn1.classList.add('doc-list');
        ctn1.innerHTML = '<h3>DANH SÁCH TÀI LIỆU LỚP</h3>';

        ctn2.innerHTML = '<div class="input-box"><label for="">ĐÍNH KÈM TỆP</label></div> <div class="documents"></div>';
        const containerOfDocList2 = ctn2.querySelector('.documents');
        //CTN2
        for (const categoryId in this.listOfDocCategoryAndDoc) {
            console.log(categoryId);
            const { categoryName, listOfDocument } = this.listOfDocCategoryAndDoc[categoryId];
            if(listOfDocument.length == 0) continue;
            const docList = document.createElement('div');

            docList.classList.add('doc-list');
            docList.innerHTML = `<h3 class="doc-category-name">${categoryName}</h3><ul class="doc-ctn"></ul>`;
            const docCtn = docList.querySelector('.doc-ctn');

            listOfDocument.sort((a, b) => {
                const fa = a.fileName.substring(a.fileName.indexOf('-') + 1);
                const fb = b.fileName.substring(a.fileName.indexOf('-') + 1);
                return fa.localeCompare(fb);
            });
            listOfDocument.forEach(({ id, fileName }) => {
                // <li><input type="checkbox" name="1" id="1"><label for="1">Bài tập chương 1</label></li>
                const fileNameToDisplay = fileName.substring(fileName.indexOf('-') + 1);
                const li = document.createElement('li');
                li.innerHTML = `<input type="checkbox" id="edt-class-attach-file--file${id}"><label for="edt-class-attach-file--file${id}">${fileNameToDisplay}</label>`;
                const checkBox = li.querySelector('input');
                checkBox.addEventListener('input', event => {
                    if(event.target.checked) {
                        //Send request to server to attach this file to class.
                        RequestHandler.sendRequest(`ajax/attach-file-to-class`, { classId: this.classId, fileId: id })
                        .then(({ e, m, d}) => {
                            if(e) {
                                alert(e);
                                return;
                            }
                            if(m == 'ok') {
                                const documentsContainer = document.querySelector('.documents');
                                const aToInner = `<a target="_blank" data-file-id="${id}" href="${this.rootUrl}/uploads/${fileName}"><span class="text">${fileNameToDisplay}</span></a>`;
                                ctn1.innerHTML += aToInner;
                                if(documentsContainer.querySelector('h3')) {
                                    documentsContainer.innerHTML = '';
                                }
                                documentsContainer.innerHTML += aToInner;
                            }
                        }).catch(error => console.error(error));
                        return;
                    }

                    //Send request to server to remove this file from class.
                    RequestHandler.sendRequest(`ajax/attach-file-from-class`, { classId: this.classId, fileId: id }, 'DELETE')
                    .then(({ e, m, d}) => {
                        if(e) {
                            alert(e);
                            return;
                        }
                        if(m == 'ok') {
                            const documentsContainer = document.querySelector('.documents');
                            const aToRemove = documentsContainer.querySelectorAll(`a[data-file-id="${id}"]`);
                            const aToRemoveFromModal = ctn1.querySelectorAll(`a[data-file-id="${id}"]`);
                            aToRemove.forEach(a => {documentsContainer.removeChild(a)});
                            aToRemoveFromModal.forEach(a => {ctn1.removeChild(a)});
                        }
                    }).catch(error => console.error(error));
                });
                if(this.listOfAttachedFileId.includes(id)) {
                    checkBox.checked = true;
                    const aToInner = `<a target="_blank" data-file-id="${id}" href="${this.rootUrl}/uploads/${fileName}"><span class="text">${fileNameToDisplay}</span></a>`;
                    ctn1.innerHTML += aToInner;
                }
                    
                docCtn.appendChild(li);
            });

            containerOfDocList2.appendChild(docList);
        }

        wrapper.appendChild(ctn1);
        wrapper.appendChild(ctn2);
        return wrapper;
    }
}

class ManageStudent {
    constructor(listOfStudent) {
        this.listOfStudent = listOfStudent;
        this.className = document.querySelector('h2.class-name').textContent;
        this.title = `Quản lý sinh viên lớp ${this.className}`;
    }

    getModalBodyContent() {
        const wrapper = document.createElement('div');
        const [ctn1, ctn2] = Array(2).fill(null).map(item => document.createElement('div'));
        wrapper.classList.add('wrapper', 'student-manage');
        ctn1.classList.add('ctn');
        ctn2.classList.add('ctn');

        console.log(this.listOfStudent);
        ctn1.innerHTML = `<div class="ctn">
            <h3>DANH SÁCH LỚP ${this.className}</h3><br>
            <table>
                <tr>
                    <th>Định danh</th>
                    <th>Họ và tên</th>
                    <th>&ensp;</th>
                </tr>
            </table>
        </div>`;
        const table = ctn1.querySelector('table');
        this.listOfStudent.forEach(student => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="std-id">${student.login_id}</td><td class="std-name">${student.name}</td>`;
            const deleteBtn = document.createElement('td');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => {
                //Send request to delete this student
                alert(student.id);
                //Then, remove view
                table.removeChild(tr);
            });
            tr.appendChild(deleteBtn);
            table.appendChild(tr);
        });

        ctn2.innerHTML = `<div class="input-box">
            <label for="upload-file">THÊM SINH VIÊN</label>
            <div style="display: flex; align-items: center;">
                <input required type="file" name="upload-file" id="upload-file" accept=".xlsx">
                <div class="btn">Thêm</div>
            </div>
            <p class="note">
                <strong>LƯU Ý</strong>: TẢI LÊN FILE EXCEL (.xlsx) CHỨA DANH SÁCH SINH VIÊN, HỆ THỐNG SẼ LẤY CỘT ĐẦU TIÊN LÀM ĐỊNH DANH, CỘT THỨ 2 LÀ HỌ TÊN SINH VIÊN.<br><br>LƯU Ý, ĐỊNH DANH KHÔNG ĐƯỢC TRÙNG, NẾU TRÙNG SẼ BỊ LỌC
            </p>
        </div>`;
        const inputFile = ctn2.querySelector('input');
        const submitBtn = ctn2.querySelector('.btn');
        submitBtn.addEventListener('click', () => {
            const file = inputFile.files[0];
            if(!file) {
                alert('Vui lòng tải tệp lên');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);
            fetch('/ajax/student-to-class', { method: 'POST', body: formData })
            .then(async (response) => {
                console.log(response);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                document.body.classList.remove('open-modal');
                alert('Thêm thành công!');
                // Lấy tên tệp từ phản hồi
                const contentDisposition = response.headers.get('Content-Disposition');
                console.log('contentDisposition: ', contentDisposition);
                const match = contentDisposition.match(/filename="(.+)"/);
                let fileName = 'Danh sách sinh viên.xlsx'; // Tên mặc định nếu không tìm thấy
                if (match && match[1]) {
                    fileName = decodeURIComponent(match[1]); // Giải mã tên tệp
                }
                // Tạo Blob từ phản hồi
                return response.blob().then(blob => ({ blob, fileName }));
            })
            .then(({ blob, fileName }) => {
                // Tạo URL từ Blob để tạo liên kết tải xuống
                var url = URL.createObjectURL(blob);
                // Tạo một thẻ a để tải xuống tệp
                var a = document.createElement('a');
                a.href = url;
                a.download = fileName; // Sử dụng tên tệp từ phản hồi
                document.body.appendChild(a);
                a.click(); // Kích hoạt sự kiện click để bắt đầu tải xuống
                window.URL.revokeObjectURL(url); // Giải phóng URL khi không cần thiết nữa
            })
            .catch(error => console.error(error));
        });

        wrapper.appendChild(ctn1);
        wrapper.appendChild(ctn2);

        return wrapper;
    }
}

class AddExercise {
    constructor({ listOfDocCategoryAndDoc, rootUrl }) {
        Object.assign(this, { listOfDocCategoryAndDoc, rootUrl });
        this.className = document.querySelector('h2.class-name').textContent;
        this.title = `Giao bài tập lớp ${this.className}`;
    }

    getModalBodyContent() {
        const wrapper = document.createElement('div');
        const ctn1 = document.createElement('div');
        const ctn2 = document.createElement('div');

        wrapper.classList.add('wrapper', 'assign-homework');
        [ctn1, ctn2].forEach(ctn => ctn.classList.add('ctn'));

        ctn1.innerHTML = `<h3>THÔNG TIN BÀI TẬP</h3>
        <div class="form-box">
            <div class="input-box">
                <form id="add-exercise-form">
                    <div class="form-row">
                        <label for="ex-name">Tên bài tập</label>
                        <input id="ex-name" type="text" placeholder="Tên bài tập" required>                                    
                    </div>
                    <div class="form-row">
                        <label for="ex-descriptions">Mô tả</label>
                        <textarea name="" id="ex-descriptions" placeholder="Mô tả"></textarea>                                    
                    </div>
                    <div class="form-row">
                        <label for="ex-start-time">Bắt đầu vào</label>
                        <input type="datetime-local" name="" id="ex-start-time" required>
                    </div>
                    <div class="form-row">
                        <label for="ex-end-time">Kết thúc vào</label>
                        <input type="datetime-local" name="" id="ex-end-time" required>
                    </div>
                    <div class="form-row">
                        <input type="reset" value="Tạo lại">
                        <a id="add-exercise-submit-btn" href="javascript:void(0)" class="btn">Thêm</a>
                    </div>
                    <input type="submit" style="display:none;">
                </form>
            </div>                
        </div>`;
        // Send request to server to add exercise
        const addExerciseForm = ctn1.querySelector('#add-exercise-form');
        addExerciseForm.addEventListener('submit', event => {
            event.preventDefault();
            const [exName, exDes, exStart, exEnd] = ['name', 'descriptions', 'start-time', 'end-time'].map(selector => {
                return ctn1.querySelector('#ex-' + selector).value;
            });
            const attachFileIds = Array.from(ctn2.querySelectorAll('input.add-exercise-modal-file:checked')).map(input => input.dataset.idFile);
            // console.log([exName, exDes, exStart, exEnd, attachFileIds]);
            RequestHandler.sendRequest('ajax/exercise', {
                exName, exDes, exStart, exEnd, attachFileIds: JSON.stringify(attachFileIds)
            }).then(({ e, m, d }) => {
                if(e) {
                    alert(e); return;
                }
                alert(m);
                document.body.classList.remove('open-modal');
                document.querySelector('.exercises').innerHTML += d;
            }).catch(error => console.log(error));
        });
        ctn1.querySelector('a#add-exercise-submit-btn').addEventListener('click', () => {
            ctn1.querySelector('input[type="submit"]').click();
        });
        ctn1.querySelector('input[type="reset"]').addEventListener('click', () => {
            modal.querySelectorAll('input.add-exercise-modal-file').forEach(input => input.checked = false);
        });

        ctn2.innerHTML = '<div class="input-box"><label for="">ĐÍNH KÈM TỆP</label></div> <div class="documents"></div>';
        const containerOfDocList2 = ctn2.querySelector('.documents');
        //CTN2
        for (const categoryId in this.listOfDocCategoryAndDoc) {
            const { categoryName, listOfDocument } = this.listOfDocCategoryAndDoc[categoryId];
            if(listOfDocument.length == 0) continue;
            const docList = document.createElement('div');

            docList.classList.add('doc-list');
            docList.innerHTML = `<h3 class="doc-category-name">${categoryName}</h3><ul class="doc-ctn"></ul>`;
            const docCtn = docList.querySelector('.doc-ctn');

            listOfDocument.sort((a, b) => {
                const fa = a.fileName.substring(a.fileName.indexOf('-') + 1);
                const fb = b.fileName.substring(a.fileName.indexOf('-') + 1);
                return fa.localeCompare(fb);
            });
            listOfDocument.forEach(({ id, fileName }) => {
                // <li><input type="checkbox" name="1" id="1"><label for="1">Bài tập chương 1</label></li>
                const fileNameToDisplay = fileName.substring(fileName.indexOf('-') + 1);
                const li = document.createElement('li');
                li.innerHTML = `<input type="checkbox" class="add-exercise-modal-file" data-id-file="${id}" id="add-exercise-modal-file${id}"><label for="add-exercise-modal-file${id}">${fileNameToDisplay}</label>`;
                docCtn.appendChild(li);
            });

            containerOfDocList2.appendChild(docList);
        }

        wrapper.appendChild(ctn1);
        wrapper.appendChild(ctn2);
        return wrapper;
    }
}

class ModalContent {
    constructor(type, data) {
        this.typeList = {
            'editDocument': EditDocumentContent,
            'editQuestLib': EditQuestLibContent,
            'editClassFileAttaches': EditClassFileAttaches,
            'manageStudent': ManageStudent,
            'addExercise': AddExercise
        }
        this.content = new this.typeList[type](data);
        console.log(type, this.content);
        this.data = data;
    }

    buildModalContent(modal) {
        modal.querySelector('.modal-header').textContent = this.content.title;
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = '';
        modalBody.appendChild(this.content.getModalBodyContent());
    }
}
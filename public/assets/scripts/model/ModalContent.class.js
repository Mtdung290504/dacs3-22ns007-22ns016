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
            const orName = name.split('-')[1];

            a.href = `uploads/${authorId}/${name}`;
            a.target = 'blank';
            a.innerHTML = `<span>${orName}</span>`;
            icon.classList.add('fa', 'fa-trash');
            icon.setAttribute('aria-hidden', 'true');
            icon.addEventListener('click', event => {
                event.preventDefault();
                if(confirm(`Xác nhận xóa tài liệu: ${id}: ${orName}`)) {
                    //Send delete request to server
                    //Ex: deleteDoc(doc.id)
                }
            });

            a.appendChild(icon);
            docList.appendChild(a);
        }

        inputBox1.innerHTML = `
        <label for="category-name">ĐỔI TÊN DANH MỤC</label>            
        <div style="display: flex; align-items: center;">
            <input type="text" name="category-name" id="category-name" placeholder="Tên mới...">
            <div class="btn">Xác nhận</div>
        </div>`;
        inputBox1.querySelector('.btn').addEventListener('click', ()=>{
            //Send request change name
            const newName = inputBox1.querySelector('input[type="text"]').value;
            if(!newName) {
                alert('Tên không phù hợp');
                return;
            }
            // alert(`Change name of id:${this.categoryId} to ${newName}`);
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

            inputFile.value = '';
            RequestHandler.sendRequest('ajax/add-docs-to-doc-category', {
                'doc-category-id': this.categoryId,
                'files': Array.from(files)
            }).then(({ e, m ,d }) => {
                if(e) alert(e);
                d.forEach(({ doc_id, file_name }) => {
                    createDocItemAndAddToList(doc_id, file_name);
                });
            }).catch(error => console.error(error));
        });

        const deleteBtn = document.createElement('div');
        deleteBtn.textContent = 'Xóa danh mục';
        deleteBtn.classList.add('btn', 'red');
        deleteBtn.addEventListener('click', () => {
            //Send request to delete category
            
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

class ModalContent {
    constructor(type, data) {
        this.typeList = {
            'editDocument': EditDocumentContent,
            'editQuestLib': EditQuestLibContent,
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
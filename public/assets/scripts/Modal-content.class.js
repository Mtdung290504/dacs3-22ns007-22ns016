class EditDocumentContent {
    constructor({categoryId, categoryName, docList}) {
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
        const [inputBox1, inputBox2] = [document.createElement('div'), document.createElement('div')].map(ib => {
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

        this.docList.forEach(doc => {//<i class="fa fa-trash" aria-hidden="true"></i>
            const a = document.createElement('a');
            const icon = document.createElement('i');

            a.innerHTML = `<span>${doc.name}</span>`;
            icon.classList.add('fa', 'fa-trash');
            icon.setAttribute('aria-hidden', 'true');
            icon.addEventListener('click', ()=>{
                if(confirm(`Xác nhận xóa tài liệu: ${doc.id}: ${doc.name}`)) {
                    //Send delete request to server
                    //Ex: deleteDoc(doc.id)
                }
            });

            a.appendChild(icon);
            docList.appendChild(a);
        });

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
                alert('Invalid');
                return;
            }
            alert(`Change name of id:${this.categoryId} to ${newName}`);
        });
        
        inputBox2.innerHTML = `
        <label for="category-name">TẢI THÊM TÀI LIỆU</label>
            <div style="display: flex; align-items: center;">
            <input type="file" name="upload-file" id="upload-file" placeholder="Tải lên...">
            <div class="btn">Thêm</div>
        </div>`;
        inputBox2.querySelector('.btn').addEventListener('click', ()=>{
            //Send request upload file
            const newName = inputBox2.querySelector('input[type="file"]').value;
            if(!newName) {
                alert('Invalid');
                return;
            }
            alert(`Upload: ${newName} to category:${this.categoryName}`);
        });

        inputs.appendChild(inputBox1);
        inputs.appendChild(inputBox2);

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
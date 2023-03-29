function loginin(){
    const form=document.forms['form'];
    let accv=form.elements.acc.value;
    let passv=form.elements.pass.value;
    console.log(accv);
    if(accv=='B10909027' && passv=='ntustmis'){
        location.href='Ubike.html';
        return false;
    }
    else{
        alert("Login Failed")
        return true;
    }
}



var div =document.getElementById('registration-form');
var display=1;
function hideshow()
{
if(display==0)
{
div.style.display='none'
display=1;
}
else
{div.style.display='block';
display=0;
}
}
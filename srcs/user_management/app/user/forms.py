from django.contrib.auth.forms import UserCreationForm
from user.models import User
from django import forms
from django.contrib.auth import authenticate
from django.conf import settings
import requests
from project.settings import C  as c

def IsIntranetUser(username):
    conf = settings.OAUTH_CONFIG['42']
    data_token = {
        'client_id': conf['client_id'],
        'client_secret': conf['client_secret'],
        'grant_type': 'client_credentials'
    }
    response = requests.post(conf['token_url'], data=data_token)
    access_token = response.json()['access_token']
    response = requests.get(conf['usrs_url'] + username, params={'access_token': access_token})

    if response.status_code == 200:
        return True
    return False

class RegisterationForm(UserCreationForm):
    email = forms.EmailField(max_length=255, help_text='required. Add a valid email')

    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'password2', 'password1')
        
    def clean_email(self):
        email = self.cleaned_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return email
        raise forms.ValidationError(f'Email {email} is already in use.')
        
    def clean_username(self):
        username = self.cleaned_data['username']
        try:
            account = User.objects.get(username=username)
        except User.DoesNotExist:
            if not IsIntranetUser('/' + username):
                return username
        raise forms.ValidationError(f'Username "{username}" is already in use.')

    def clean_first_name(self):
        first_name = self.cleaned_data['first_name']
        if not first_name.isalpha():
            raise forms.ValidationError('first_name must be alphabet')
        return first_name
            
    def clean_last_name(self): 
        last_name = self.cleaned_data['last_name']
        if not last_name.isalpha():
            raise forms.ValidationError('last_name must be alphabet')
        return last_name
        
    def clean_password1(self):
        password1 = self.cleaned_data['password1']
        password2 = self.cleaned_data['password2']
        if password1 and password2 and password1 == password2:
            return password1
        raise forms.ValidationError("password and the comfirmed not identical")



class LoginForm(forms.ModelForm):
    password = forms.CharField(label='password', widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ('username', 'password')
        
    def clean(self):
        if self.is_valid():
            username = self.cleaned_data['username']
            password = self.cleaned_data['password']
            if not authenticate(username=username, password=password):
                raise forms.ValidationError("Invalid login")
            

                         
class EditUserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('username', 'last_name', 'first_name',)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].required = False
        self.fields['last_name'].required = False
        self.fields['first_name'].required = False
    
    def clean(self):
        cleaned_data = super().clean()
        print("<<<<<<<<<<<<<<<<CLEANED DATTA",cleaned_data,flush=True)
        print("<<<<<<<<<<<<<<<<GET DATTA",self.fields,flush=True)
        modified_fields = []
        for field in self.fields:
            if self.cleaned_data.get(field) != getattr(self.instance, field):
                modified_fields.append(field)
                print(">>>>>>>>>modified ",modified_fields,flush=True)
        if 'username' in modified_fields:
            self.clean_username()

        if 'first_name' in modified_fields:
            self.clean_first_name()

        if 'last_name' in modified_fields:
            self.clean_last_name()

    def clean_username(self):
        username = self.cleaned_data['username']
        try:
            account = User.objects.get(username=username)
        except User.DoesNotExist:
            if not IsIntranetUser('/' + username):
                return username
        raise forms.ValidationError(f'Username "{username}" is already in use.')

    def clean_first_name(self):
        first_name = self.cleaned_data['first_name']
        if not first_name.isalpha():
            raise forms.ValidationError('first_name must be alphabet')
        return first_name

    def clean_last_name(self): 
        last_name = self.cleaned_data['last_name']
        if not last_name.isalpha():
            raise forms.ValidationError('last_name must be alphabet')
        return last_name
                
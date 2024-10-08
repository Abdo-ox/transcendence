
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
from chat.models import Coalition


def create_initial_instances(apps, schema_editor):
    Coalition.objects.get_or_create(name='NightSpin',image='https://localhost/images/whitwill/coalition5.png')
    Coalition.objects.get_or_create(name='EclipsePong',image='https://localhost/images/whitwill/coalition4.png')
    Coalition.objects.get_or_create(name='GhostPaddle',image='https://localhost/images/whitwill/coalition3.png')

class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AddCoalition',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('add', models.PositiveIntegerField(default=0)),
            ],
            options={
                'db_table': 'addcoalition',
            },
        ),
        migrations.CreateModel(
            name='Coalition',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField(default='')),
                ('score', models.PositiveIntegerField(default=0)),
                ('image', models.TextField(default='')),
            ],
            options={
                'db_table': 'coalition',
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('first_name', models.CharField(default='', max_length=20, verbose_name='first_name')),
                ('last_name', models.CharField(default='', max_length=20, verbose_name='last_name')),
                ('email', models.EmailField(max_length=60, unique=True, verbose_name='email')),
                ('username', models.CharField(max_length=60, unique=True, verbose_name='username')),
                ('date_joined', models.DateTimeField(auto_now_add=True, verbose_name='date joined')),
                ('last_joined', models.DateTimeField(auto_now=True, verbose_name='last joined')),
                ('is_admin', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_superuser', models.BooleanField(default=False)),
                ('profile_image', models.TextField(blank=True, default='https://localhost/images/profile_images/unkown.jpg', max_length=255)),
                ('hide_email', models.BooleanField(default=True)),
                ('intraNet', models.BooleanField(default=False)),
                ('is_2fa_passed', models.BooleanField(default=False)),
                ('Twofa_Code', models.BigIntegerField(default=0)),
                ('enable2fa', models.BooleanField(default=False)),
                ('reset_Code', models.BigIntegerField(default=0)),
                ('MailConfirmation', models.BigIntegerField(default=0)),
                ('coalition', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='users', to='chat.coalition')),
            ],
            options={
                'db_table': 'user',
            },
        ),
        migrations.CreateModel(
            name='Contact',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_friends', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'contact',
            },
        ),
        migrations.CreateModel(
            name='FriendList',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('friends', models.ManyToManyField(blank=True, related_name='friends', to=settings.AUTH_USER_MODEL)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='user', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'friendlist',
            },
        ),
        migrations.CreateModel(
            name='FriendRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_active', models.BooleanField(blank=True, default=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('receiver', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='receiver', to=settings.AUTH_USER_MODEL)),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sender', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'friendrequest',
            },
        ),
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('aiScore', models.IntegerField(default=0)),
                ('playerScore', models.IntegerField(default=0)),
                ('won', models.BooleanField(default=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='games', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'game',
            },
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('contact', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='chat.contact')),
            ],
            options={
                'db_table': 'message',
            },
        ),
        migrations.CreateModel(
            name='Chat',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('participants', models.ManyToManyField(related_name='chats', to='chat.contact')),
                ('messages', models.ManyToManyField(blank=True, to='chat.message')),
            ],
            options={
                'db_table': 'chat',
            },
        ),
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(default='', max_length=255)),
                ('players', models.ManyToManyField(related_name='tournaments', to=settings.AUTH_USER_MODEL)),
                ('winner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='wonTournaments', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'tournament',
            },
        ),
        migrations.CreateModel(
            name='MultiGame',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('player2Score', models.IntegerField(default=0)),
                ('player1Score', models.IntegerField(default=0)),
                ('room_name', models.CharField(default='', max_length=255)),
                ('isOver', models.BooleanField(default=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('players', models.ManyToManyField(related_name='multiPlayerGames', to=settings.AUTH_USER_MODEL)),
                ('winner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='wonGames', to=settings.AUTH_USER_MODEL)),
                ('tournaments', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='games', to='chat.tournament')),
            ],
            options={
                'db_table': 'multigame',
            },
        ),
        migrations.RunPython(create_initial_instances),
    ]

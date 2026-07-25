from rest_framework import serializers
from django.contrib.auth.models import User
from .models import TextileWaste, UserProfile


class TextileWasteSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(
        source='created_by.username', read_only=True, default=None
    )

    class Meta:
        model = TextileWaste
        fields = [
            'id', 'batch_id', 'material_type', 'quantity', 'color',
            'source', 'condition', 'status', 'collection_date',
            'created_by', 'created_by_username', 'date_added',
        ]
        read_only_fields = ['id', 'batch_id', 'created_by', 'date_added']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    role = serializers.ChoiceField(
        choices=UserProfile.ROLE_CHOICES,
        write_only=True
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def validate(self, attrs):

        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({
                "username": "This username already exists."
            })

        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({
                "email": "This email is already registered."
            })

        return attrs

    def create(self, validated_data):

        role = validated_data.pop("role")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"]
        )

        UserProfile.objects.create(
            user=user,
            role=role
        )

        return user

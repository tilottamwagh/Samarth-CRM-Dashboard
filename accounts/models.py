from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone


class Plan(models.Model):
    """SaaS Subscription Plans"""
    PLAN_CHOICES = [
        ('starter', 'Starter'),
        ('pro', 'Pro'),
        ('enterprise', 'Enterprise'),
    ]
    name = models.CharField(max_length=100)
    slug = models.CharField(max_length=50, choices=PLAN_CHOICES, unique=True)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=499)
    price_yearly = models.DecimalField(max_digits=10, decimal_places=2, default=4990)
    max_users = models.IntegerField(default=3)
    max_whatsapp_numbers = models.IntegerField(default=1)
    ai_queries_limit = models.IntegerField(default=100)
    max_leads = models.IntegerField(default=500)
    features = models.JSONField(default=dict)  # additional feature flags
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - ₹{self.price_monthly}/mo"

    class Meta:
        db_table = 'plans'


class Tenant(models.Model):
    """Multi-tenant organizations (each SaaS customer is a Tenant)"""
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    email = models.EmailField()
    mobile = models.CharField(max_length=15, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    logo = models.ImageField(upload_to='tenant_logos/', null=True, blank=True)
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True)
    gst_number = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    address = models.TextField(blank=True)
    ai_queries_used = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def queries_left(self):
        if self.plan:
            return max(0, self.plan.ai_queries_limit - self.ai_queries_used)
        return 0

    class Meta:
        db_table = 'tenants'


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'superadmin')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model supporting multi-tenancy"""
    ROLE_CHOICES = [
        ('superadmin', 'Super Admin'),
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('employee', 'Employee'),
        ('sales', 'Sales'),
        ('support', 'Support'),
        ('viewer', 'Viewer'),
    ]
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, null=True, blank=True, related_name='users')
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=15, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = UserManager()

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    class Meta:
        db_table = 'users'


class SalesTarget(models.Model):
    """Monthly sales targets for employees"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sales_targets')
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    achieved_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    month = models.IntegerField()  # 1-12
    year = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sales_targets'
        unique_together = ['user', 'month', 'year']


class Dealer(models.Model):
    """Dealer/Partner management"""
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='dealers')
    name = models.CharField(max_length=200)
    mobile = models.CharField(max_length=15)
    country_code = models.CharField(max_length=5, default='91')
    city = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    gst_number = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    industry = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'dealers'

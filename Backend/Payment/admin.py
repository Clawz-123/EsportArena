from django.contrib import admin

from .models import PaymentOrder


@admin.register(PaymentOrder)
class PaymentOrderAdmin(admin.ModelAdmin):
	list_display = ('user', 'provider', 'amount', 'coins', 'status', 'pidx', 'created_at')
	list_filter = ('provider', 'status')
	search_fields = ('user__email', 'pidx')
	list_select_related = ('user',)

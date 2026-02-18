from django.contrib import admin

from .models import Wallet, WalletTransaction


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
	list_display = ('user', 'balance', 'updated_at')
	search_fields = ('user__email',)
	list_select_related = ('user',)


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
	list_display = ('wallet', 'transaction_type', 'direction', 'amount', 'status', 'method', 'created_at')
	list_filter = ('transaction_type', 'direction', 'status', 'method')
	search_fields = ('wallet__user__email', 'reference')
	list_select_related = ('wallet', 'wallet__user')

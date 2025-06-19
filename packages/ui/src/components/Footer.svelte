<script lang="ts">
	const year: number = new Date().getFullYear();
</script>

<hr class="mt-20 md:mt-32 lg:mt-40 border-t border-border-input sm:mb-6 mb-1 w-full col-span-12" />

<footer class="col-span-12 grid grid-cols-12 gap-4 md:gap-3 sm:gap-2 xs:gap-1 py-6">
	<p class="col-span-12 sm:col-span-6">&copy; Accessibility.cool — {year}</p>
	<nav
		aria-labelledby="footer-nav-label"
		class="col-span-12 sm:col-span-6 flex justify-start sm:justify-end"
	>
		<span id="footer-nav-label" class="sr-only">Footer navigation</span>
		<ul class="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto sm:ml-0">
			<li class="w-full sm:w-auto">
				<a href="/imprint" class="block w-full sm:w-auto hover:underline">Imprint</a>
			</li>
			<li class="w-full sm:w-auto">
				<a href="/privacy-policy" class="block w-full sm:w-auto hover:underline"
					>Privacy Policy</a
				>
			</li>
		</ul>
	</nav>
</footer>

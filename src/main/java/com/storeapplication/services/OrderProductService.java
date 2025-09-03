package com.storeapplication.services;

import com.storeapplication.models.Order;
import com.storeapplication.models.OrderProduct;
import com.storeapplication.repository.OrderProductRepository;
import com.storeapplication.repository.OrderRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderProductService {


	private OrderProductRepository orderProductRepository;
	private OrderRepository orderRepository;

	public OrderProductService(OrderProductRepository orderProductRepository, OrderRepository orderRepository) {
		this.orderProductRepository = orderProductRepository;
		this.orderRepository = orderRepository;
	}

	@Transactional
	public List<OrderProduct> saveOrderProducts(List<OrderProduct> orderProducts) {
		return orderProductRepository.saveAll(orderProducts);
	}

	@Transactional
	public void removeOrderProducts(List<OrderProduct> orderProducts) {
		orderProductRepository.deleteAll(orderProducts);
	}

	@Transactional
	public String addOrderProduct(OrderProduct orderProduct) {
		Order transientOrder = orderProduct.getOrder();
		if (transientOrder == null || transientOrder.getId() == null) {
			return "Order reference is required";
		}

		Order order = orderRepository.findById(transientOrder.getId()).orElse(null);
		if (order == null) {
			return "Order not found";
		}

		orderProduct.setOrder(order);
		orderProductRepository.save(orderProduct);

		BigDecimal currentTotal = order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount();
		BigDecimal price = orderProduct.getPriceAtOrderTime() == null ? BigDecimal.ZERO : orderProduct.getPriceAtOrderTime();
		BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(orderProduct.getQuantity()));
		order.setTotalAmount(currentTotal.add(lineTotal));
		orderRepository.save(order);

		return "Successfully added order product";
	}

	@Transactional
	public String deleteOrderProduct(Long id) {
		OrderProduct orderProduct = orderProductRepository.findById(id).orElse(null);
		if  (orderProduct != null) {
			Order order = orderProduct.getOrder();
			if (order != null) {
				BigDecimal currentTotal = order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount();
				BigDecimal price = orderProduct.getPriceAtOrderTime() == null ? BigDecimal.ZERO : orderProduct.getPriceAtOrderTime();
				BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(orderProduct.getQuantity()));
				BigDecimal updated = currentTotal.subtract(lineTotal);
				if (updated.compareTo(BigDecimal.ZERO) < 0) {
					updated = BigDecimal.ZERO;
				}
				order.setTotalAmount(updated);
				orderRepository.save(order);
			}
			orderProductRepository.delete(orderProduct);
			return null;
		}
		return "Order product not found";
	}




}
